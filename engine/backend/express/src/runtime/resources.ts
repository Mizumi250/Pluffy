import { Model } from './model'

export type ResourceFields = Record<string, (value: any) => any>

function one(value: any, fields: ResourceFields) {
  if (value instanceof Model) {
    const source = value.toJSON()
    return Object.fromEntries(Object.entries(fields).map(([key, read]) => [key, read(source)]))
  }
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(fields).map(([key, read]) => [key, read(value)]))
}

export function resourceTransform(value: any, fields: ResourceFields): any {
  if (Array.isArray(value)) return value.map(item => one(item, fields))
  if (value && Array.isArray(value.data) && 'current_page' in value) {
    return { ...value, data: value.data.map((item: any) => one(item, fields)) }
  }
  return one(value, fields)
}

export function resourceCollection(values: any[], fields: ResourceFields) {
  return values.map(value => one(value, fields))
}
