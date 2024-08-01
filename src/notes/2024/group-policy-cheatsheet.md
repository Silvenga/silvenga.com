---
tags:
  - active-directory
title: Active Directory/Group Policy Cheatsheet
description: My personal cheatsheet for AD/GPO.
---
## Introduction

I always need to lookup Group Policy/Active Directory commands, I just don't touch it enough - which might be by design....

### Get a User's/Workstation's Effective Policy

```powershell
gpresult /h "$(pwd)\gpo-report.html"

# And open the report in the default browser.
Invoke-Item "$(pwd)\gpo-report.html"
```

- `/h` "html report", generate an HTML report.

[Source](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/gpresult)

### Force Replication between All sites/domain Controllers

```powershell
repadmin /syncall /d /e
```

- `/d` "distinguished name", forces displaying domain controllers by their distinguished name instead their useless GUID.
- `/e` "everything", forces replication between all sites.

[Source](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc835086(v=ws.11))
