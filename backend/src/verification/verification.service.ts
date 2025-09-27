import { v4 as uuidv4 } from 'uuid';
import { query, queryActive } from '@config/database';
import { VerificationRequest } from '@types/index';
import { NotFoundError, AuthorizationError } from '@utils/errors';
import { logger } from '@utils/logger';

export class VerificationService {
  async createRequest(
    doctorId: string,
    patientAddress: string,
    traitType: string,
    requirements?: any
  ): Promise<VerificationRequest> {
    // Get patient ID from wallet address
    const patients = await queryActive<{ id: string }>(
      'SELECT id FROM users WHERE wallet_address = $1',
      [patientAddress]
    );

    if (patients.length === 0) {
      throw new NotFoundError('Patient');
    }

    const patientId = patients[0].id;
    const requestId = uuidv4();

    const result = await query<VerificationRequest>(
      `INSERT INTO verification_requests
       (id, patient_id, doctor_id, trait_type, status, requirements, created_at)
       VALUES ($1, $2, $3, $4, 'pending', $5, NOW())
       RETURNING *`,
      [requestId, patientId, doctorId, traitType, JSON.stringify(requirements || {})]
    );

    logger.info(`Verification request ${requestId} created by doctor ${doctorId} for patient ${patientId}`);

    return result[0];
  }

  async getRequestsForPatient(patientId: string): Promise<VerificationRequest[]> {
    const requests = await queryActive<VerificationRequest>(
      `SELECT vr.*, u.wallet_address as doctor_address
       FROM verification_requests vr
       JOIN users u ON u.id = vr.doctor_id
       WHERE vr.patient_id = $1
       ORDER BY vr.created_at DESC`,
      [patientId]
    );

    return requests;
  }

  async getRequestsForDoctor(doctorId: string): Promise<VerificationRequest[]> {
    const requests = await queryActive<VerificationRequest>(
      `SELECT vr.*, u.wallet_address as patient_address
       FROM verification_requests vr
       JOIN users u ON u.id = vr.patient_id
       WHERE vr.doctor_id = $1
       ORDER BY vr.created_at DESC`,
      [doctorId]
    );

    return requests;
  }

  async respondToRequest(
    requestId: string,
    patientId: string,
    approved: boolean,
    proofHash?: string
  ): Promise<VerificationRequest> {
    // Verify the request belongs to the patient
    const existingRequest = await queryActive<VerificationRequest>(
      'SELECT * FROM verification_requests WHERE id = $1 AND patient_id = $2',
      [requestId, patientId]
    );

    if (existingRequest.length === 0) {
      throw new NotFoundError('Verification request');
    }

    if (existingRequest[0].status !== 'pending') {
      throw new AuthorizationError('Request already responded to');
    }

    const status = approved ? 'approved' : 'denied';

    const result = await query<VerificationRequest>(
      `UPDATE verification_requests
       SET status = $1, proof_hash = $2, responded_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, proofHash, requestId]
    );

    logger.info(`Verification request ${requestId} ${status} by patient ${patientId}`);

    return result[0];
  }

  async getRequestHistory(doctorId: string): Promise<VerificationRequest[]> {
    const history = await queryActive<VerificationRequest>(
      `SELECT vr.*, u.wallet_address as patient_address
       FROM verification_requests vr
       JOIN users u ON u.id = vr.patient_id
       WHERE vr.doctor_id = $1
       ORDER BY vr.created_at DESC
       LIMIT 100`,
      [doctorId]
    );

    return history;
  }
}

export const verificationService = new VerificationService();