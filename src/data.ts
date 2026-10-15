import type { AttentionCase, Person, Procedure } from './types'

export const people: Person[] = [
  { id: '16000001A', name: 'Petra', surnames: 'Llop Arana', language: 'CAS', postalCode: '48001', treatment: 'Femenino' },
  { id: '16000002B', name: 'Aimar', surnames: 'Onaindia Ruiz', language: 'EUS', postalCode: '48930', treatment: 'Masculino' },
  { id: '16000003C', name: 'June', surnames: 'Zubia Etxeberria', language: 'EUS', postalCode: '48011', treatment: 'Femenino' },
  { id: '16000004D', name: 'Nora', surnames: 'Sanz Bilbao', language: 'CAS', postalCode: '48901', treatment: 'Femenino' },
  { id: '16000005E', name: 'Markel', surnames: 'Aguirre Landa', language: 'CAS', postalCode: '48340', treatment: 'Masculino' },
]

export const procedures: Procedure[] = [
  { id: 'TR-001', name: 'PNC Jubilación', type: 'Solicitud', procedure: 'Prestaciones', collective: 'Personas físicas en dependencia o discapacidad', department: 'Acción Social', topic: 'Servicios sociales · Dependencia · Discapacidad' },
  { id: 'TR-002', name: 'Modificación de datos', type: 'Modificación', procedure: 'Datos personales', collective: 'Ciudadanía', department: 'Administración Pública', topic: 'Identidad y datos personales' },
  { id: 'TR-003', name: 'Udalekuak 2026', type: 'Solicitud', procedure: 'Programas juveniles', collective: 'Familias y menores', department: 'Euskera, Cultura y Deporte', topic: 'Juventud · Ocio educativo' },
  { id: 'TR-004', name: 'Ayuda individual para movilidad', type: 'Solicitud', procedure: 'Ayudas económicas', collective: 'Personas con discapacidad', department: 'Acción Social', topic: 'Movilidad · Autonomía personal' },
  { id: 'TR-005', name: 'Inscripción en actividades deportivas', type: 'Inscripción', procedure: 'Actividades', collective: 'Ciudadanía', department: 'Euskera, Cultura y Deporte', topic: 'Deporte · Participación' },
  { id: 'TR-006', name: 'Consulta tributaria general', type: 'Consulta', procedure: 'Información tributaria', collective: 'Personas físicas y jurídicas', department: 'Hacienda y Finanzas', topic: 'Tributos · Información' },
  { id: 'TR-007', name: 'Subvención para eficiencia energética', type: 'Solicitud', procedure: 'Subvenciones', collective: 'Hogares de Bizkaia', department: 'Medio Natural', topic: 'Energía · Sostenibilidad' },
  { id: 'TR-008', name: 'Reclamación de consumo', type: 'Reclamación', procedure: 'Protección de consumo', collective: 'Personas consumidoras', department: 'Promoción Económica', topic: 'Consumo · Reclamaciones' },
  { id: 'TR-009', name: 'Cita para valoración de dependencia', type: 'Cita previa', procedure: 'Valoraciones', collective: 'Personas en situación de dependencia', department: 'Acción Social', topic: 'Dependencia · Valoración' },
  { id: 'TR-010', name: 'Tarjeta de transporte social', type: 'Solicitud', procedure: 'Bonificaciones', collective: 'Personas beneficiarias', department: 'Transportes y Movilidad', topic: 'Transporte · Bonificaciones' },
]

const service = (id: string, name: string, result: 'Completado' | 'Abierto' | 'Pendiente', notes: string) => ({ id, name, result, notes })

export const seededCases = (): AttentionCase[] => [
  {
    id: 'CAS-260115-01', procedure: procedures[0], notes: 'La persona solicita información sobre requisitos y presenta la documentación disponible.',
    services: [service('S-01', 'Consulta', 'Completado', 'Se detecta un error en la información publicada.'), service('S-02', 'Registro', 'Completado', 'Documentación registrada correctamente.')],
    tasks: [{ id: 'T-01', text: 'Avisar al departamento del error detectado', done: true }], interestedPerson: people[0],
  },
  {
    id: 'CAS-260115-02', procedure: procedures[1], notes: 'Actualización del domicilio a efectos de notificación.',
    services: [service('S-03', 'Consulta', 'Completado', 'Datos contrastados.'), service('S-04', 'Cita previa', 'Abierto', 'Cita propuesta para el 22/10 a las 10:30.')],
    tasks: [{ id: 'T-02', text: 'Confirmar cita con la persona interesada', done: false }], interestedPerson: people[0],
  },
  {
    id: 'CAS-260115-03', procedure: procedures[2], notes: 'Consulta de plazas y calendario de inscripción.',
    services: [service('S-05', 'Consulta', 'Completado', 'Calendario y documentación entregados.')], tasks: [], interestedPerson: people[0],
  },
]

export const serviceNames = ['Información general', 'Información particular', 'Consulta', 'Registro', 'Tramitación', 'Asistencia a la tramitación', 'Cita previa', 'Entrega de documentación']
