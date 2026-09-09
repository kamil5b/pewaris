export type {
  RelationshipType,
  Candidate,
  EligibleHeir,
  AhliWarisResult,
  MahjubResult,
  CalculationStep,
  InheritanceResult,
} from './result'

export {
  getRelationship,
  findSpouse,
  findChildren,
  findParentsOf,
  findSiblings,
} from './relationship'

export { resolveCandidates } from './candidates'
export { checkEligibility } from './eligibility'
export { determineMahjub, filterEligibleHeirs } from './mahjub'
export { calculateFurudh, calculateTotalFurudh } from './furudh'
export { calculateAshabah } from './ashabah'
export { handleAwl } from './awl'
export { handleRadd } from './radd'
export { simulateInheritance } from './calculate'
