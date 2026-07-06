export const CERTIFICATION_GATE_IDS = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'] as const
export type CertificationGateId = (typeof CERTIFICATION_GATE_IDS)[number]

export type CertificationGateDefinition = {
  id: CertificationGateId
  title: string
  description: string
  signer: string
  auto: boolean
}

export const GATE_DEFINITIONS: CertificationGateDefinition[] = [
  {
    id: 'G1',
    title: 'Written Checks',
    description: 'All training track quizzes passed at 80% or higher (automatic).',
    signer: 'System',
    auto: true,
  },
  {
    id: 'G2',
    title: 'Practical: Planted-Errors QBO Exercise',
    description: 'Complete the planted-errors QuickBooks Online exercise.',
    signer: 'Trainer',
    auto: false,
  },
  {
    id: 'G3',
    title: 'Practical: POS Reconciliation Exercise',
    description: 'Complete the POS-to-QBO reconciliation practical exercise.',
    signer: 'Trainer',
    auto: false,
  },
  {
    id: 'G4',
    title: 'Supervised Close on Demo Client',
    description: 'Perform a supervised weekly close on a demo client file.',
    signer: 'Senior Accountant',
    auto: false,
  },
  {
    id: 'G5',
    title: 'Solo Close with Senior Review',
    description: 'Complete a solo close; senior reviews after submission.',
    signer: 'Program Lead',
    auto: false,
  },
  {
    id: 'G6',
    title: 'Golden Rules Oral Check + Seat SOP',
    description: 'Pass the golden-rules oral check and acknowledge seat SOP.',
    signer: 'Program Lead',
    auto: false,
  },
]

export const ACADEMY_EMAIL_FROM = 'FinAcct360 Academy <academy@finacct360.io>'
