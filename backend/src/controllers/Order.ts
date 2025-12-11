import { NextFunction, Request, Response } from "express";
import { Order } from "../modals/Order";
import { User } from "../modals/User";
import {
  sendMailOrderDetailsClient,
  sendMailOrderDetailsDistributor,
} from "../utils/features";
import { Service } from "../modals/Service";

export const newOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("name email phoneNumber");
    const {
      serviceIds,
      address,
      city,
      state,
      pincode: orderPincode,
    } = req.body;

    const services = await Service.find({
      _id: { $in: serviceIds },
    }).select("name");
    const serviceNames = services.map((service) => service.name);

    const distributor = await User.findOne({
      role: { $in: ["admin", "distributor"] },
      pincode: orderPincode,
    });

    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: "No distributor found with the given pincode",
      });
    }

    const distributorId = distributor._id;

    const newOrder = new Order({
      userId,
      distributorId,
      serviceIds,
      address,
      city,
      state,
      pincode: orderPincode,
    });

    await newOrder.save();

    sendMailOrderDetailsDistributor(
      user!.name,
      address,
      distributor!.email,
      serviceNames,
      user!.phoneNumber,
      process.env.SUBJECT_ORDER_CONFIRMATION_DISTRIBUTOR!,
      process.env.TEXT_ORDER_CONFIRMATION_DISTRIBUTOR!
    );
    sendMailOrderDetailsClient(
      user!.name,
      user!.email,
      serviceNames,
      distributor.phoneNumber,
      process.env.SUBJECT_ORDER_CONFIRMATION_CLIENT!,
      process.env.TEXT_ORDER_CONFIRMATION_CLIENT!
    );
    return res.status(201).json({
      success: true,
      order: newOrder,
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Order not Found",
      });
    }

    const deletedOrder = await Order.findByIdAndDelete(id, { new: true });

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Order deleted Successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

export const getDistributorOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Spam detected",
      });
    }

    const filter: any = { distributorId: id };
    const distributorOrders = await Order.find(filter)
      .populate<{
        userId: { name: string; phoneNumber: number; photo: string };
      }>("userId", "name phoneNumber photo")
      .populate<{ serviceIds: { name: string }[] }>("serviceIds", "name");

    if (distributorOrders.length === 0) {
      return res.status(200).json({
        success: false,
        distributorOrders,
      });
    }

    const formattedOrders = distributorOrders.map((order) => ({
      orderDate: order.orderDate,
      status: order.status,
      orderId: order._id,
      user: {
        name: order.userId?.name,
        phoneNumber: order.userId?.phoneNumber,
        photo: order.userId?.photo,
      },
      services: order.serviceIds.map((service) => service.name),
      address: order.address,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
    }));

    return res.status(200).json({
      success: true,
      distributorOrders: formattedOrders,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getUserOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Spam detected",
      });
    }

    const filter: {
      userId: string;
    } = { userId: id as string };

    const totalOrders = await Order.countDocuments(filter);

    const userOrders = await Order.find(filter).populate<{
      serviceIds: { name: string; photo: string }[];
    }>("serviceIds", "name photo");

    if (userOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for the user",
      });
    }

    const formattedOrders = userOrders.map((order) => ({
      orderDate: order.orderDate,
      status: order.status,
      services: order.serviceIds.map((service) => ({
        name: service.name,
        photo: service.photo,
      })),
    }));

    return res.status(200).json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    console.log(error);
  }
};

export const changeOrderStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required",
      });
    }

    const validStatuses = ["processing", "processed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed statuses are 'processing' or 'processed'",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.log(error);
  }
};
