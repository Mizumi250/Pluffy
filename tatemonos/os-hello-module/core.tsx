/* @arkzen:meta
name: os-hello-module
version: 0.1.0
description: A Linux kernel module (built only, load it in a virtual machine)
auth: false
*/

/* @arkzen:os:project
name: hello
kind: driver
host: linux
language: c
license: GPL-2.0-only
*/

/* @arkzen:os:driver:hello
class: serial
bus: platform
module: hello_serial
params: [loglevel]
*/

/* @arkzen:os:source:c:hello
part: driver
*/
#include <linux/init.h>
#include <linux/module.h>

static int __init hello_init(void)
{
    pr_info("hello_serial: loaded\n");
    return 0;
}

static void __exit hello_exit(void)
{
    pr_info("hello_serial: unloaded\n");
}

module_init(hello_init);
module_exit(hello_exit);
MODULE_LICENSE("GPL");
/* @arkzen:os:source:c:hello:end */
