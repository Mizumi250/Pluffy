import type { Model } from './model'

export interface FactoryDefinition { [key: string]: any | (() => any) }

export function factoryFor<M extends typeof Model>(model: M, definition: FactoryDefinition) {
  const make = (overrides: Record<string, any> = {}, index = 0) => {
    const values = Object.fromEntries(Object.entries(definition).map(([key, value]) => [
      key,
      typeof value === 'function' ? value(index) : value,
    ]))
    return new (model as any)({ ...values, ...overrides })
  }
  const state = (values: FactoryDefinition) => factoryFor(model, { ...definition, ...values })
  const createMany = async (amount: number, overrides: Record<string, any> = {}) => {
    const rows = []
    for (let i = 0; i < amount; i++) rows.push(await make(overrides, i).save())
    return rows
  }
  return {
    make,
    create: async (overrides: Record<string, any> = {}) => make(overrides).save(),
    createMany,
    count: createMany,
    state,
  }
}
