---
tags: 
  - posts
  - linux
  - security
title: LUKS TPM Unlock
description: Unlocking full-disk LUKS encryption with a TPM during boot.
---

[[toc]]

## Introduction

For a long time, it just wasn't practical to run Linux servers with LUKS full-disk encryption (or, at least very fun). Basically, our options were to:

1. Require operators to be present to manually unlock servers on boot/reboot. This could be mitigated by running a small SSH Server during boot (e.g.  Dropbear SSH), so remote unlocks could be possible (with the increased risk of evil-maid/MITM attacks, SSH host keys are unprotected).
2. Bake in custom and hard-to-debug scripts into initramfs (Initial Ram Disk) and execute these scripts during early boot (also at risk of evil-maid, unless your script sealing with a TPM).

I am so happy that LUKS auto-unlocking has finally been made easy (and even better, supported by multiple Linux vendors).

## BitLocker

Windows, on the other hand, had really good disk-encryption by default - BitLocker. Windows can encrypt your boot drives automatically (and in place, using partition juggling), and unlock the drives on boot. Not only was this incredibly secure, it was also trivial to setup - so easy in-fact, organizations typically enabled BitLocker automatically (and not baked into their deployment images, so no risk of duplicate encryption keys).

In a nutshell, BitLocker is a lot like LUKS. Both don't encrypt your data with your passphrase, rather, both generate a different key (the master key), and encrypt that key with your passphrase (after going through a key stretching algorithm, e.g. HMAC). This encrypted key is ultimately stored with your encrypted data. During boot, this key is decrypted and is used to decrypt all the other data on the drive.

This indirect process of encrypting your data with a secret has many benefits, both to security and user convince. For example, this indirectness quickly change your disk unlock passphrase, since only the key is being re-encrypted. Another side effect, both LUKS and BitLocker support multiple keys. These different keys all just decrypt the same master decryption key.

BitLocker typically generates two keys by default - a backup recovery key (basically, a randomly generated password, stored on the disk, accessible to administrators) and a TPM "sealed" key.

### The Boot Process

So how does BitLocker use the TPM to decrypt your disk, and how does it attempt to do this safely? It's starts with the boot process, which basically looks like this:

1. Hardware initialized - control is given to the UEFI (aka, the BIOS).
2. UEFI scans for stuff, including any bootable drives. If discovered/configured, control is given to code on these bootable drives.
3. Bootloader executes (Grub2) and scans for the next stage (`vmlinuz`).
4. If found, Grub2 validates that the kernel was signed by it's public key. If valid, then the kernel is given control.
5. The kernel (e.g. `vmlinuz`) loads and everything else gets mounted.
6. The kernel decrypts the "sealed" master key with the help of the TPM.
7. The OS is live!

### Secure Boot and the TPM

During the boot process, Secure boot and the TPM (trusted platform module) work together - both are needed for BitLocker to unlock a drive automatically.

**Secure boot** validates that the code UEFI is going to execute (aka, the bootloader) hasn't been modified (aka, via an evil-maid attack). It does this by checking asymmetrical signatures with public keys stored in the UEFI firmware. Typical servers/computers contain the public key of Microsoft (which signs the Windows bootloader). On the Linux side, the bootloader (grub2) is typically signed by a Microsoft donated key - allowing grub to execute in a secure boot environment (without needing custom UEFI firmware) or special hardware vendors.

The **TPM** (trusted platform module) is a cryptographic device, it can do many things, but it's mostly used to encrypt/decrypt small pieces of data. The TPM stores the private key, and in-theory, as the TPM can't be easily physically modified, we can typically consider the private key safe (unless a TPM bug exists).

One cool thing about the TPM, it stores data from events occurring during the boot process in the Platform Configuration Registers or **PCR**'s - kind of like a log of boot events. The PCR's store the cryptographic hash of these events, like what kind of hardware was discovered, what firmware is installed, has anything been modified, is secure boot happy about the bootloader, etc.

All of these PCR "**measurements**" (as they are called) are stateless, and are generated during boot determinist - meaning the same configuration will result in the exact same PCR's. Using that knowledge, the TPM can "seal" data using it's private key, and the state of the PCR's. Meaning, the TPM, along with the hardware, the firmware, and the software all effectively **combine** to become the password to decrypt the master decryption key.

This ultimately allows Windows to decrypt itself through the guarantee the system is in the exact same configuration as when the OS was last running. If anything changes in this system configuration, the TPM effective becomes locked, refusing to expose it's secrets to anyone without an electron microscope (for an offline attack).

> I'm just making the assumption that TPM is safe here - any kinds of bus attacks is typically out-of-scope of random bad-guys that find HDD's in the trash.

## LUKS TPM Unlock

So, BitLocker is cool. It both made the hardware generally available to every user and made full-disk encryption trivial for consumers. Both are great for Linux users as we can piggy back off of the success of Microsoft. The question is how (and using LUKS)?

\
**To the CLI!**

### Setup the TPM

First double check your TPM is enabled (modern platforms, the CPU can provide a TPM, disabled by default sometimes).

```bash
journalctl -k --grep=tpm
```

You should see something like this:

```logs
May 10 11:07:35 gn1 kernel: efi: TPMFinalLog=0x6d1dd000 SMBIOS=0x6eee2000 SMBIOS 3.0=0x6eee1000 ACPI 2.0=0x6c695000 ACPI=0x6c695000 ESRT=0x666e6858 MOKvar=0x6d857000 TPMEventLog=0x5c69d018
May 10 11:07:35 gn1 kernel: ACPI: TPM2 0x000000006C7FBED8 000034 (v03 SUPERM SMCI--MB 00000001 AMI  00000000)
May 10 11:07:35 gn1 kernel: ACPI: Reserving TPM2 table memory at [mem 0x6c7fbed8-0x6c7fbf0b]
May 10 11:07:35 gn1 kernel: tpm_tis MSFT0101:00: 2.0 TPM (device-id 0x1B, rev-id 16)
```

> There are multiple kernel LTS/non-LTS  versions that broke Intel TPM support due to a change in handling of some AMD CPU's. It took about a month for a patch to rollout to my Ubuntu HWE LTS kernel `6.5.0`.

Assuming Linux detected a TPM, next we need to take ownership of the TPM, by clearing the TPM (regenerates keys).

```bash
# If not installed:
# apt install -y tpm2-tools

tpm2_clear
```

This might require a reboot and physical presence to push a button, depending on the motherboard vendor.

### Setup Clevis

Now that the TPM is prepared, we can setup `clevis` to automatically create and seal a LUKS key slot and to use this slot during boot to unlock LUKS (using `clevis-luks` and `clevis-tpm2`). Also, while `clevis` can be made to work with  `initramfs-tools`, `dracut` is looking to be the modern replacement (`dracut` and `initramfs-tools` do similar things with preparing the `initramfs`). Installing `clevis-dracut` is optional if using `initramfs-tools`.

> Note that `dracut` replaces `initramfs-tools` - both can't be installed concurrently (`apt` will automatically remove `initramfs-tools` and the metapackage `ubuntu-server` when installing `dracut`).

```bash
apt-get install clevis clevis-luks clevis-tpm2 clevis-dracut
```

### Bind Clevis and LUKS

Now to "seal" the LUKS master key we can use Clevis:

```bash
clevis luks bind -d /dev/<disk> tpm2 '{"pcr_bank":"sha256", "pcr_ids":"1,7"}'
```

Not all TPM's default to using SHA256 for PCR measurements, so be explicit here (`pcr_bank`). The `pcr_ids` are the banks used for sealing and depend on your risk factors. With `1` and `7` specified, I'm basically instructing the TPM to use "Core system firmware data/host platform configuration" and "Secure Boot state" when "sealing" the master key (meaning, neither may change).

After binding Clevis and LUKS, the Clevis modules need to be injected into `initramfs`. This is done in a similar way to `update-initramfs`.

```bash
dracut -f
```

At this point the system encrypted with LUKS can be rebooted without an operator's intervention.

> You should make sure there's a recovery key somewhere, if any hardware becomes damaged.

### PCR Choices

Each PCR bank contains a hash for a different system component. It's basically a setting of how much trust the TPM should have about the system.

Copying from the [man of `systemd-cryptenroll`](https://man.archlinux.org/man/systemd-cryptenroll.1#TPM2_PCRs_and_policies) (a possible future, less mature than Clevis, buggy on Ubuntu 22.04 LTS).

| PCR | name                | Explanation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | platform-code       | Core system firmware executable code; changes on firmware updates                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 1   | platform-config     | Core system firmware data/host platform configuration; typically contains serial and model numbers, changes on basic hardware/CPU/RAM replacements                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2   | external-code       | Extended or pluggable executable code; includes option ROMs on pluggable hardware                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 3   | external-config     | Extended or pluggable firmware data; includes information about pluggable hardware                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 4   | boot-loader-code    | Boot loader and additional drivers, PE binaries invoked by the boot loader; changes on boot loader updates. [sd-stub(7)](https://man.archlinux.org/man/sd-stub.7.en) measures system extension images read from the ESP here too (see [systemd-sysext(8)](https://man.archlinux.org/man/systemd-sysext.8.en)).                                                                                                                                                                                                                                                 |
| 5   | boot-loader-config  | GPT/Partition table; changes when the partitions are added, modified, or removed                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 7   | secure-boot-policy  | Secure Boot state; changes when UEFI SecureBoot mode is enabled/disabled, or firmware certificates (PK, KEK, db, dbx, ...) changes.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 9   | kernel-initrd       | The Linux kernel measures all initrds it receives into this PCR.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 10  | ima                 | The IMA project measures its runtime state into this PCR.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 11  | kernel-boot         | [systemd-stub(7)](https://man.archlinux.org/man/systemd-stub.7.en) measures the ELF kernel image, embedded initrd and other payload of the PE image it is placed in into this PCR. [systemd-pcrphase.service(8)](https://man.archlinux.org/man/systemd-pcrphase.service.8.en) measures boot phase strings into this PCR at various milestones of the boot process.                                                                                                                                                                                             |
| 12  | kernel-config       | [systemd-boot(7)](https://man.archlinux.org/man/systemd-boot.7.en) measures the kernel command line into this PCR. [systemd-stub(7)](https://man.archlinux.org/man/systemd-stub.7.en) measures any manually specified kernel command line (i.e. a kernel command line that overrides the one embedded in the unified PE image) and loaded credentials into this PCR.                                                                                                                                                                                           |
| 13  | sysexts             | [systemd-stub(7)](https://man.archlinux.org/man/systemd-stub.7.en) measures any [systemd-sysext(8)](https://man.archlinux.org/man/systemd-sysext.8.en) images it passes to the booted kernel into this PCR.                                                                                                                                                                                                                                                                                                                                                    |
| 14  | shim-policy         | The shim project measures its "MOK" certificates and hashes into this PCR.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 15  | system-identity     | [systemd-cryptsetup(8)](https://man.archlinux.org/man/systemd-cryptsetup.8.en) optionally measures the volume key of activated LUKS volumes into this PCR. [systemd-pcrmachine.service(8)](https://man.archlinux.org/man/systemd-pcrmachine.service.8.en) measures the [machine-id(5)](https://man.archlinux.org/man/machine-id.5.en) into this PCR. [systemd-pcrfs@.service(8)](https://man.archlinux.org/man/systemd-pcrfs@.service.8.en) measures mount points, file system UUIDs, labels, partition UUIDs of the root and /var/ filesystems into this PCR. |
| 16  | debug               | Debug                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 23  | application-support | Application Support                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

The PCR's you select is a balance between security and annoyance. The more PCR banks used, the more likely an auto-unlock will fail.

Banks `1` and `7` are commonly chosen, and is rumored to be what Windows uses. Using only these prevents breaking auto-unlock by allowing most of the firmware and the bootloader to be updated (as long as the bootloader is signed by a UEFI key). If either the UEFI verification key changes, UEFI verification is disabled, or major hardware components are swapped, then the TPM will refuse to decrypt the LUKS container. This is a good balance between security and convince.

A more extreme configuration is to also require bank `4`, to ensure that downgrading the bootloader to a buggy version will also not boot.
