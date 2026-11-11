import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/AppError'
import { getProjectAuditLogs } from './audit-log.service'

export const getProjectAuditLogsController = async (
    req: Request<{ projectId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { projectId } = req.params;

        const userId = req.user!.userId;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        if (
            !Number.isInteger(page) ||
            !Number.isInteger(limit) ||
            page < 1 ||
            limit < 1 ||
            limit > 100
        ) {
            throw new AppError("INVALID_PAGINATION", 400);
        }

        const result = await getProjectAuditLogs(
            projectId,
            userId,
            page,
            limit
        );

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        next(error);
    }
};