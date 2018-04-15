Title: Upgrading the Firmware on Infineon TPM's
Description: Upgrading the Infineon TPM firmware on Asus (and friends) motherboards.
Published: 4/14/18
---

In early October of 2017, researchers announced, publicly, a cryptographic vulnerability in the RSA generation algorithms found within practically every TPM, using Infineon's RSA library. This vulnerability would effectively allow an attacker to easily guess the private key component of the RSA key stored within the TPM - rendering the protections and insurances granted by the TPM useless. Turns out, many TPM's actually use Infineon's technologies, meaning many TPM's are vulnerability - including all Asus and Gigabyte TPM's (that I know of). 

> tl;dr - TPM broke, I sad, TPM need fix.

Since the point of TPM's is to perform key protection inside hardware, a software fix is impossible. This is so difficult to mitigate that Window's just resorts to emitting a warning in the Event Logs like the one below:

```ps1
> Get-EventLog -LogName System -Source Microsoft-Windows-TPM-WMI -EntryType Error | select Message

The Trusted Platform Module (TPM) firmware on this PC has a known security problem. 
Please contact your PC manufacturer to find out if an update is available. 
For more information please go to https://go.microsoft.com/fwlink/?linkid=852572
```
Now, 6 months later and over a year since Infineon was notified of this issue, Asus and Gigabyte have yet to release updates for their TPM's. Although, I'm not particularly surprised considering most consumers would likely brick their machine's when trying to update (or not need to update to begin with). Thankfully, many enterprise-centered company's use these Infineon based TPM's, meaning we, the consumers, can piggyback off of enterprise clients shouting for a fix.

In this case, it turns out that the Asus and Gigabyte TPM's are effectively the same one's found in some Supermicro servers, and of course, Supermicro had to release firmware updates - updates that we can use.

## Getting Started

Before I get started, I want to make sure the TPM is working in my device. I can ask Window's about it via the `Get-TPM` command.

```ps1
> Get-Tpm

TpmPresent          : True
TpmReady            : False
ManufacturerId      : 1229346816
ManufacturerVersion : 5.61
ManagedAuthLevel    : Delegated
OwnerAuth           :
OwnerClearDisabled  : True
AutoProvisioning    : Enabled
LockedOut           : False
LockoutCount        : 0
LockoutMax          : 32
SelfTest            : {}
```

## Getting the Firmware

Everything looks good! Now to get the firmware. I found a compatible version on [Supermicro's driver FTP site](ftp://ftp.supermicro.com/driver/TPM/).

```ps1
Invoke-WebRequest -Uri ftp://ftp.supermicro.com/driver/TPM/9665FW%20update%20package_1.1.zip -OutFile '9665FW update package_1.1.zip' -UseBasicParsing
Expand-Archive '.\9665FW update package_1.1.zip' -DestinationPath .
cd '.\9665FW update package_1.1\'
```

Looking through the files extracted files, there are two directories:

```ps1
> ls | select Name

Firmware
Tools
9665.nsh
Readme.txt
```

The important files are these:

```
Firmware\* <- containing the TPM firmwares.
Tools\WinPE\Bin\x64\TPMFactoryUpd.exe <- The actual updater, for Windows.
```

I'm going to copy the above to the same folder, because I'm lazy.

```ps1
mkdir workspace
cp .\Firmware\* .\workspace\
cp .\Tools\WinPE\Bin\x64\* .\workspace\
```

Now `.\workspace` contains the following files:

```ps1
> ls | select Name

License_FW_Images.pdf
TPM12_4.40.119.0_to_TPM12_4.43.257.0.BIN
TPM12_4.40.119.0_to_TPM20_5.62.3126.0.BIN
TPM12_4.42.132.0_to_TPM12_4.43.257.0.BIN
TPM12_4.42.132.0_to_TPM20_5.62.3126.0.BIN
TPM12_4.43.257.0_to_TPM20_5.62.3126.0.BIN
TPM12_4.43.257.0_to_TPM20_5.80.2910.2.BIN
TPM12_latest.cfg
TPM20_5.51.2098.0_to_TPM12_4.43.257.0.BIN
TPM20_5.51.2098.0_to_TPM20_5.62.3126.0.BIN
TPM20_5.60.2677.0_to_TPM12_4.43.257.0.BIN
TPM20_5.60.2677.0_to_TPM20_5.62.3126.0.BIN
TPM20_5.61.2785.0_to_TPM12_4.43.257.0.BIN
TPM20_5.61.2785.0_to_TPM20_5.62.3126.0.BIN
TPM20_5.61.2789.0_to_TPM12_4.43.257.0.BIN
TPM20_5.61.2789.0_to_TPM20_5.62.3126.0.BIN
TPM20_5.62.3126.0_to_TPM12_4.43.257.0.BIN
TPM20_latest.cfg
TPMFactoryUpd.efi
TPMFactoryUpd.exe
TVicPort.sys
```

Now to upgrading the firmware!

## Upgrading the Firmware

Let's make sure `TPMFactoryUpd.exe` detects the TPM.

```ps1
> .\TPMFactoryUpd.exe -info

  **********************************************************************
  *    Infineon Technologies AG   TPMFactoryUpd   Ver 01.01.2212.00    *
  **********************************************************************

       TPM information:
       ----------------
       Firmware valid                    :    Yes
       TPM family                        :    2.0
       TPM firmware version              :    5.61.2785.0
       TPM platformAuth                  :    Not Empty Buffer
       Remaining updates                 :    64
```

And it does, sweet! Now to run the upgrade.

```ps1
> .\TPMFactoryUpd.exe -update config-file -config TPM20_latest.cfg

  **********************************************************************
  *    Infineon Technologies AG   TPMFactoryUpd   Ver 01.01.2212.00    *
  **********************************************************************

       TPM update information:
       -----------------------
       Firmware valid                    :    Yes
       TPM family                        :    2.0
       TPM firmware version              :    5.61.2785.0
       Remaining updates                 :    64
       New firmware valid for TPM        :    Yes
       TPM family after update           :    2.0
       TPM firmware version after update :    5.62.3126.0

       Selected firmware image:
       TPM20_5.61.2785.0_to_TPM20_5.62.3126.0.BIN

       Preparation steps:
       TPM2.0 policy session creation failed.

  ----------------------------------------------------------------------
  *    Error Information                                               *
  ----------------------------------------------------------------------

  Error Code:     0xE0295507
  Message:        TPM2.0: PlatformAuth is not the Empty Buffer. The
                  firmware cannot be updated.

  See the log file (TPMFactoryUpd.log) for further information.
```

Sad panda, it turns out we need to disable the TPM module in the BIOS/UEFI before we can flash the firmware update. Time to connect my Spider KVM and boot into the UEFI menu. BTW, [Spiders](https://www.lantronix.com/products/lantronix-spider/) are awesome, but don't pay full price!

^^^
![Post Screen](/content/images/2018/post-screen.png)
^^^ Window Server Core reboots way too fast, had to reboot multiple times to get what button to press.

![Asus UEFI Screen](/content/images/2018/asus-uefi.png)

Now to disable the TPM.

![Disable TPM](/content/images/2018/disable-tpm.png)

After booting back into Windows, it looks like disabling the TPM fixes the `Empty Buffer` problem: 

```ps1
> .\TPMFactoryUpd.exe -info

  **********************************************************************
  *    Infineon Technologies AG   TPMFactoryUpd   Ver 01.01.2212.00    *
  **********************************************************************

       TPM information:
       ----------------
       Firmware valid                    :    Yes
       TPM family                        :    2.0
       TPM firmware version              :    5.61.2785.0
       TPM platformAuth                  :    Empty Buffer
       Remaining updates                 :    64
```

Now I can try to update the TPM again.

```ps1
cd '.\9665FW update package_1.1\workspace\'
.\TPMFactoryUpd.exe -update config-file -config TPM20_latest.cfg

  **********************************************************************
  *    Infineon Technologies AG   TPMFactoryUpd   Ver 01.01.2212.00    *
  **********************************************************************

       TPM update information:
       -----------------------
       Firmware valid                    :    Yes
       TPM family                        :    2.0
       TPM firmware version              :    5.61.2785.0
       Remaining updates                 :    64
       New firmware valid for TPM        :    Yes
       TPM family after update           :    2.0
       TPM firmware version after update :    5.62.3126.0

       Selected firmware image:
       TPM20_5.61.2785.0_to_TPM20_5.62.3126.0.BIN

       Preparation steps:
       TPM2.0 policy session created to authorize the update.

    DO NOT TURN OFF OR SHUT DOWN THE SYSTEM DURING THE UPDATE PROCESS!

       Updating the TPM firmware ...
       Completion: 100 %
       TPM Firmware Update completed successfully.
```

And it works!

## Wrapping Things Up

 A disabled TPM is rather useless, time to boot back into the UEFI menus to enable it.

^^^
![Enable TPM](/content/images/2018/enable-tpm.png)
^^^ Looks like the UEFI requires a reboot to update this menu.

And since this vulnerability is for RSA key generation, it's best to reset all generated keys. I used a TPM clear to do this, plus a reboot.

![Clear TPM](/content/images/2018/clear-tpm.png)

After getting back into Windows, I'm greeted with a lovely success message.

```ps1
> Get-EventLog -LogName System -Source Microsoft-Windows-TPM-WMI | select Message

The TPM was successfully provisioned and is now ready for use.
The TBS device identifier has been generated.
The Ownership of the Trusted Platform Module (TPM) hardware on this computer was successfully taken (TPM TakeOwnership command) by the system.
```

And as a final check, it looks like the `ManufacturerVersion` was updated to `5.62`.

```ps1
> Get-Tpm

TpmPresent          : True
TpmReady            : True
ManufacturerId      : 1229346816
ManufacturerVersion : 5.62
ManagedAuthLevel    : Delegated
OwnerAuth           :
OwnerClearDisabled  : True
AutoProvisioning    : Enabled
LockedOut           : False
LockoutCount        : 0
LockoutMax          : 32
SelfTest            : {}
```

Yeah, no more weak keys!