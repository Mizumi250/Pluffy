/* @arkzen:meta
name: term-shelf
version: 1.0.0
description: Book shelf record manager
auth: false
*/

/* @arkzen:term:project
name: shelf
binary: shelf
mode: tui
runtimes: [ts, rs]
mouse: true
alt_screen: true
min_size:
  width: 60
  height: 18
*/

/* @arkzen:term:runtime:ts
framework: ink
*/

/* @arkzen:term:runtime:rs
framework: ratatui
edition: 2021
*/

/* @arkzen:term:theme
palette:
  ink: "#e6e1d8"
  moss: "#7a9a6d"
  rust: "#c0705a"
roles:
  primary: moss
  error: rust
  selection:
    color: moss
    bold: true
border: rounded
fallback:
  moss: green
  rust: red
*/

/* @arkzen:term:data:books
storage: json
file: books.json
location: xdg
sort: title
fields:
  - name: title
    type: string
    required: true
    searchable: true
    sortable: true
  - name: author
    type: string
  - name: read
    type: bool
    default: false
  - name: shelf
    type: choice
    choices: [home, library]
    default: home
seed:
  - title: Dune
    author: Frank Herbert
*/

/* @arkzen:term:screen:main
title: Shelf
layout: split
size: [2, 1]
panes:
  - widget: table
    data: books
    columns: [title, author, read]
    keymap: main
    focus: 1
  - widget: form
    data: books
    focus: 2
*/

/* @arkzen:term:keymap:main
actions:
  new: [n]
  edit: [e, enter]
  delete: [d]
  search: ["/"]
  quit: [q, ctrl+c]
vim: true
help: true
mouse:
  click: true
  scroll: true
*/

/* @arkzen:term:export
platforms: [linux-x64, macos-arm64]
formats: [single_binary, archive, cargo_install]
*/
