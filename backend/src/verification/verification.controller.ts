import { Request, Response } from 'express';
import { verificationService } from './verification.service';
import { VerificationRequestInput, VerificationResponseInput } from './verification.types';
import { logger } from '@utils/logger';

export class VerificationController {
  async request(req: Request<{}, {}, VerificationRequestInput>, res: Response) {
    const doctorId = req.user!.id;
    const { patientAddress, traitType, requirements } = req.body;

    const request = await verificationService.createRequest(
      doctorId,
      patientAddress,
      traitType,
      requirements
    );

    res.json({
      success: true,
      data: {
        requestId: request.id,
        status: request.status,
        traitType: request.traitType,
        createdAt: request.createdAt
      },
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }

  async list(req: Request, res: Response) {
    const userId = req.user!.id;
    const role = req.user!.role;

    const requests = role === 'patient'
      ? await verificationService.getRequestsForPatient(userId)
      : await verificationService.getRequestsForDoctor(userId);

    res.json({
      success: true,
      data: { requests },
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }

  async respond(
    req: Request<{ requestId: string }, {}, VerificationResponseInput>,
    res: Response
  ) {
    const patientId = req.user!.id;
    const { requestId } = req.params;
    const { approved } = req.body;

    // TODO: Generate proof if approved
    const proofHash = approved ? `0x${Date.now().toString(16)}` : undefined;

    const updatedRequest = await verificationService.respondToRequest(
      requestId,
      patientId,
      approved,
      proofHash
    );

    res.json({
      success: true,
      data: {
        requestId: updatedRequest.id,
        status: updatedRequest.status,
        proofHash: updatedRequest.proofHash,
        respondedAt: updatedRequest.respondedAt
      },
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }

  async history(req: Request<{ doctorId: string }>, res: Response) {
    const { doctorId } = req.params;

    // Verify the requesting doctor can only access their own history
    if (req.user!.id !== doctorId && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own request history'
        }
      });
    }

    const history = await verificationService.getRequestHistory(doctorId);

    res.json({
      success: true,
      data: { history },
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }
}

export const verificationController = new VerificationController();