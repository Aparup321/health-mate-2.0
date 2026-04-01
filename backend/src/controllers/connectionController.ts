import { type Request, type Response } from "express";
import { ConnectionRequest, SendConnectionRequestSchema } from "../models/ConnectionRequest";
import { User } from "../models/User";
import { sendSuccessResponse, ValidationError, NotFoundError, ConflictError } from "../utils/errorHandler";
import { asyncHandler } from "../utils/errorHandler";

class ConnectionController {
  sendRequest = asyncHandler(
    async (req: Request, res: Response) => {
      const fromUserId = req.userId!;
      const { toUserId } = req.validatedBody || req.body;

      if (fromUserId === toUserId) {
        throw new ValidationError("You cannot send a connection request to yourself");
      }

      const fromUser = await User.findById(fromUserId);
      if (!fromUser) {
        throw new NotFoundError("User not found");
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        throw new NotFoundError("User not found");
      }

      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
        status: "pending",
      });

      if (existingRequest) {
        throw new ConflictError("A pending request already exists");
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        fromUserName: fromUser.name,
        fromReferralCode: fromUser.referralCode,
        toUserId,
        toUserName: toUser.name,
        toReferralCode: toUser.referralCode,
        status: "pending",
      });

      await connectionRequest.save();

      sendSuccessResponse(res, 201, connectionRequest, "Connection request sent");
    }
  );

  getReceivedRequests = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;

      const requests = await ConnectionRequest.find({
        toUserId: userId,
        status: "pending",
      }).sort({ createdAt: -1 });

      sendSuccessResponse(
        res,
        200,
        { requests, count: requests.length },
        "Received requests retrieved"
      );
    }
  );

  getSentRequests = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;

      const requests = await ConnectionRequest.find({
        fromUserId: userId,
        status: "pending",
      }).sort({ createdAt: -1 });

      sendSuccessResponse(
        res,
        200,
        { requests, count: requests.length },
        "Sent requests retrieved"
      );
    }
  );

  getConnections = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;

      const connections = await ConnectionRequest.find({
        $or: [{ fromUserId: userId }, { toUserId: userId }],
        status: "accepted",
      }).sort({ updatedAt: -1 });

      const formattedConnections = connections.map((conn) => {
        const isFromMe = conn.fromUserId === userId;
        return {
          id: conn._id,
          userId: isFromMe ? conn.toUserId : conn.fromUserId,
          userName: isFromMe ? conn.toUserName : conn.fromUserName,
          referralCode: isFromMe ? conn.toReferralCode : conn.fromReferralCode,
          connectedAt: conn.updatedAt,
        };
      });

      sendSuccessResponse(
        res,
        200,
        { connections: formattedConnections, count: formattedConnections.length },
        "Connections retrieved"
      );
    }
  );

  respondToRequest = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { id } = req.params;
      const { status } = req.validatedBody || req.body;

      const request = await ConnectionRequest.findById(id);
      if (!request) {
        throw new NotFoundError("Connection request not found");
      }

      if (request.toUserId !== userId) {
        throw new ValidationError("You can only respond to requests sent to you");
      }

      if (request.status !== "pending") {
        throw new ConflictError("This request has already been responded to");
      }

      request.status = status;
      await request.save();

      const message = status === "accepted" ? "Request accepted" : "Request declined";
      sendSuccessResponse(res, 200, request, message);
    }
  );

  cancelRequest = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { id } = req.params;

      const request = await ConnectionRequest.findById(id);
      if (!request) {
        throw new NotFoundError("Connection request not found");
      }

      if (request.fromUserId !== userId) {
        throw new ValidationError("You can only cancel requests you sent");
      }

      if (request.status !== "pending") {
        throw new ConflictError("This request can no longer be cancelled");
      }

      await ConnectionRequest.findByIdAndDelete(id);

      sendSuccessResponse(res, 200, {}, "Request cancelled");
    }
  );

  removeConnection = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { id } = req.params;

      const connection = await ConnectionRequest.findById(id);
      if (!connection) {
        throw new NotFoundError("Connection not found");
      }

      if (connection.fromUserId !== userId && connection.toUserId !== userId) {
        throw new ValidationError("You are not part of this connection");
      }

      if (connection.status !== "accepted") {
        throw new ConflictError("This is not an active connection");
      }

      await ConnectionRequest.findByIdAndDelete(id);

      sendSuccessResponse(res, 200, {}, "Friend removed");
    }
  );
}

export default new ConnectionController();
