/* @arkzen:meta
name: notes-sdk
version: 1.2.0
description: Notes API with generated clients
auth: true
*/

/* @arkzen:database:notes
table: notes
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  title:
    type: string
    length: 255
    nullable: false
*/

/* @arkzen:api:notes
model: Note
controller: NoteController
prefix: /api/notes
middleware: []
resource: true
*/

/* @arkzen:pkg:project:notes-sdk
name: notes-sdk
kind: sdk
license: MIT
targets: [npm, pypi]
*/

/* @arkzen:pkg:sdk:notes-sdk
languages: [ts, py]
include: [notes]
auth: bearer
*/

/* @arkzen:pkg:target:npm
package: notes-sdk
name: "@demo/notes-sdk"
*/

/* @arkzen:pkg:target:pypi
package: notes-sdk
name: demo-notes-sdk
requires_python: ">=3.10"
*/
