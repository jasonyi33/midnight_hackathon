import { nanoid } from 'nanoid'
import CryptoJS from 'crypto-js'
import { laceWallet } from '../wallet/lace-wallet'
import { demoEvents } from '../realtime/demo-events'
import type {
  ApiClient,
  AuthRequestPayload,
  AuthResponse,
  ConsentResponsePayload,
  GenomeSummary,
  GenomeUploadPayload,
  GenomeUploadResponse,
  ProofGenerationPayload,
  ProofJob,
  ProofRecord,
  VerificationRequest,
} from './types'
import type { AuthTokens, Role, UserProfile } from '../../../types/auth'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const demoUsers: Record<string, Role> = {
  'addr_patient_demo': 'patient',
  'addr_doctor_demo': 'doctor',
}

const traitLibrary: GenomeSummary['markers'] = [
  {
    id: 'BRCA1',
    label: 'BRCA1 germline mutation',
    description: 'Determines eligibility for selective estrogen receptor modulators.',
    available: true,
  },
  {
    id: 'BRCA2',
    label: 'BRCA2 germline mutation',
    description: 'Supports insurance underwriting without exposing unrelated markers.',
    available: true,
  },
  {
    id: 'CYP2D6',
    label: 'CYP2D6 metabolizer status',
    description: 'Guides pharmacogenomic dosing strategies for opioids and antidepressants.',
    available: true,
  },
]

type DemoDatabase = {
  tokens: Record<string, AuthTokens>
  userProfiles: Record<string, UserProfile>
  genome: GenomeUploadResponse
  proofJobs: Record<string, ProofJob>
  proofs: ProofRecord[]
  verificationRequests: VerificationRequest[]
}

const createInitialDb = (): DemoDatabase => ({
  tokens: {},
  userProfiles: {},
  genome: {
    status: 'pending',
    cid: null,
    commitmentHash: null,
    uploadedAt: null,
    markers: traitLibrary,
  },
  proofJobs: {},
  proofs: [],
  verificationRequests: [
    {
      id: nanoid(12),
      doctorId: 'doctor-demo',
      doctorDisplayName: 'Dr. Elise Johnson',
      patientId: 'patient-demo',
      traitType: 'BRCA1',
      status: 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    },
  ],
})

const db: DemoDatabase = createInitialDb()

const persistToken = (address: string, tokens: AuthTokens) => {
  db.tokens[address] = tokens
}

const persistProfile = (profile: UserProfile) => {
  db.userProfiles[profile.address] = profile
}

const scheduleProofProgress = (jobId: string) => {
  const tick = () => {
    const job = db.proofJobs[jobId]
    if (!job) return
    if (job.status === 'completed' || job.status === 'failed') {
      return
    }

    const nextProgress = Math.min(job.progress + Math.random() * 35 + 15, 100)
    job.progress = nextProgress
    job.status = nextProgress >= 99 ? 'completed' : 'running'

    if (job.status === 'completed') {
      job.completedAt = new Date().toISOString()
      job.progress = 100
      job.verificationUrl = `https://demo.midnight.explorer/tx/${nanoid(10)}`
      db.proofs.unshift({
        id: nanoid(10),
        traitType: job.traitType,
        generatedAt: job.completedAt,
        verificationUrl: job.verificationUrl,
        status: 'valid',
      })
    }

    demoEvents.dispatchEvent(
      new CustomEvent('proof:progress', {
        detail: job,
      }),
    )

    if (job.status !== 'completed') {
      setTimeout(tick, 900)
    } else {
      demoEvents.dispatchEvent(
        new CustomEvent('notifications:new', {
          detail: {
            kind: 'proof-complete',
            job,
          },
        }),
      )
    }
  }

  setTimeout(tick, 800)
}

class DemoApiClient implements ApiClient {
  async authenticate(payload: AuthRequestPayload): Promise<AuthResponse> {
    await delay(400)
    const role = demoUsers[payload.address] ?? 'patient'
    const tokens = laceWallet.createAuthTokens(payload.address, payload.signature)
    persistToken(payload.address, tokens)

    const profile: UserProfile = {
      id: laceWallet.hashAddress(payload.address).slice(0, 32),
      address: payload.address,
      displayName: payload.address.startsWith('addr')
        ? payload.address
        : laceWallet.hashAddress(payload.address).slice(0, 10),
      role,
      balance: '999.42 tDUST',
    }
    persistProfile(profile)

    return {
      tokens,
      user: profile,
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    await delay(200)
    return laceWallet.createAuthTokens(`demo-${refreshToken.slice(0, 4)}`, refreshToken)
  }

  async getGenomeSummary(): Promise<GenomeSummary> {
    await delay(200)
    return db.genome
  }

  async uploadGenome(payload: GenomeUploadPayload): Promise<GenomeUploadResponse> {
    await delay(600)

    const commitmentHash = CryptoJS.SHA256(payload.encryptedData).toString(CryptoJS.enc.Hex)
    db.genome = {
      status: 'uploaded',
      cid: `bafy${nanoid(32)}`,
      commitmentHash,
      uploadedAt: new Date().toISOString(),
      markers: traitLibrary,
    }

    demoEvents.dispatchEvent(
      new CustomEvent('genome:uploaded', {
        detail: db.genome,
      }),
    )

    return db.genome
  }

  async requestProof(payload: ProofGenerationPayload): Promise<{ jobId: string }> {
    await delay(300)
    const jobId = nanoid(14)
    db.proofJobs[jobId] = {
      jobId,
      traitType: payload.traitType,
      status: 'queued',
      progress: 0,
      startedAt: new Date().toISOString(),
    }
    scheduleProofProgress(jobId)
    return { jobId }
  }

  async getProofJob(jobId: string): Promise<ProofJob> {
    await delay(150)
    const job = db.proofJobs[jobId]
    if (!job) {
      throw new Error('Proof job not found')
    }
    return job
  }

  async listProofs(): Promise<ProofRecord[]> {
    await delay(200)
    return db.proofs
  }

  async listVerificationRequests(): Promise<VerificationRequest[]> {
    await delay(200)
    return db.verificationRequests
  }

  async respondToVerification(payload: ConsentResponsePayload): Promise<VerificationRequest> {
    await delay(250)
    const request = db.verificationRequests.find((item) => item.id === payload.requestId)
    if (!request) {
      throw new Error('Verification request not found')
    }
    request.status = payload.decision
    request.respondedAt = new Date().toISOString()
    request.expiresAt = payload.expiresAt ?? request.expiresAt

    demoEvents.dispatchEvent(
      new CustomEvent('consent:updated', {
        detail: request,
      }),
    )

    return request
  }
}

export const demoApiClient: ApiClient = new DemoApiClient()
