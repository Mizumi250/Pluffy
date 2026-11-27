/* @arkzen:meta
name: notes-sdk
version: 1.2.0
description: Notes API with a generated client
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

/* @arkzen:pkg:project:notes-sdk
name: notes-sdk
kind: sdk
license: MIT
targets: [npm, pypi]
*/

/* @arkzen:pkg:sdk:notes-sdk
languages: [ts, py]
include: [notes, auth]
auth: bearer
retries: 1
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
