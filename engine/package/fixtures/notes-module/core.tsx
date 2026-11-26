/* @arkzen:meta
name: notes-module
version: 1.0.0
description: Notes backend module for Laravel hosts
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

/* @arkzen:pkg:project:notes-module
name: notes-module
kind: backend
license: MIT
targets: [packagist]
*/

/* @arkzen:pkg:backend:notes-module
backend: laravel
include: [database:notes, api:notes]
mount: /notes
auth: host
*/

/* @arkzen:pkg:target:packagist
package: notes-module
vendor: demo
name: demo/notes-module
php: "^8.2"
*/
