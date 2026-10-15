export type Channel = 'Presencial' | 'Telefónico'
export type Result = 'Completado' | 'Abierto' | 'Pendiente'

export interface Person {
  id: string
  name: string
  surnames: string
  language: string
  postalCode: string
  treatment: string
}

export interface Procedure {
  id: string
  name: string
  type: string
  procedure: string
  collective: string
  department: string
  topic: string
}

export interface Service {
  id: string
  name: string
  result: Result
  notes: string
}

export interface Task {
  id: string
  text: string
  done: boolean
}

export interface AttentionCase {
  id: string
  procedure: Procedure
  services: Service[]
  notes: string
  tasks: Task[]
  interestedPerson?: Person
  derived?: {
    type: string
    manager: string
    delegate: string
    notes: string
  }
}
