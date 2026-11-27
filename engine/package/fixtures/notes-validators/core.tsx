/* @arkzen:meta
name: notes-validators
version: 1.2.0
description: Notes validators
auth: false
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
  body:
    type: text
    nullable: true
  pinned:
    type: boolean
    nullable: false
    default: false
*/

/* @arkzen:api:notes
model: Note
controller: NoteController
prefix: /api/notes
middleware: [auth]
resource: true
endpoints:
  index:
    method: GET
    route: /
    description: List notes
    response:
      type: paginated
  store:
    method: POST
    route: /
    description: Create a note
    validation:
      title: required|string|max:255
      body: nullable|string
      pinned: sometimes|boolean
    response:
      type: single
  show:
    method: GET
    route: /{id}
    description: Get one note
    response:
      type: single
  update:
    method: PUT
    route: /{id}
    description: Update a note
    validation:
      title: sometimes|string|max:255
      body: nullable|string
      pinned: sometimes|boolean
    response:
      type: single
  destroy:
    method: DELETE
    route: /{id}
    description: Delete a note
    response:
      type: message
      value: Note deleted
*/

/* @arkzen:pkg:project
name: notes-validators
kind: validators
license: MIT
targets: [npm]
*/

/* @arkzen:pkg:validators
languages: [ts]
emit_vectors: true
*/

/* @arkzen:pkg:target:npm
name: "@demo/notes-validators"
*/
