/* @arkzen:meta
name: os-kiosk-distro
version: 0.1.0
description: A minimal Linux image for a kiosk
auth: false
*/

/* @arkzen:os:project
name: kiosk
kind: distro
license: MIT
*/

/* @arkzen:os:distro
builder: buildroot
packages: [busybox, dropbear]
init: busybox
hostname: kiosk
users:
  - name: operator
*/

/* @arkzen:os:image
formats: [raw]
*/
