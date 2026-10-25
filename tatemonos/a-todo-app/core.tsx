/* @arkzen:meta
name: a-todo-app
version: 1.0.0
description: A simple CRUD-based to-do list.
auth: false
*/

/* @arkzen:meta:web
favicon: 📅
title: Todo Arkzen
description: A simple CRUD todo list built on Arkzen
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "min-h-screen bg-neutral-50"
*/

/* @arkzen:database:todos
table: todos
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  content:
    type: string
    length: 255
    nullable: false
  done:
    type: boolean
    default: false
*/

/* @arkzen:api:todos
model: Todo
controller: TodoController
prefix: /api/a-todo-app
middleware: []
resource: true
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /todos
    description: Get all todos
    response:
      type: collection

  store:
    method: POST
    route: /todos
    description: Create a new todo
    validation:
      content: required|string|max:255
    response:
      type: single

  update:
    method: PUT
    route: /todos/{id}
    description: Update a todo
    validation:
      content: sometimes|string|max:255
      done: sometimes|boolean
    response:
      type: single

  destroy:
    method: DELETE
    route: /todos/{id}
    description: Delete a todo
    response:
      type: message
      value: Todo deleted
*/

/* @arkzen:web:components:shared */

'use client'

import React, { useState } from 'react'
import { CheckCircle, Trash2 } from 'lucide-react'

/* @arkzen:web:components:shared:end */
