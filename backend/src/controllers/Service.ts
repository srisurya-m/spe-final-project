import { NextFunction, Request, Response } from "express";
import { Service } from "../modals/Service";
import { Provider } from "../modals/Provider";
import { User } from "../modals/User";
import { uploadToCloudinary } from "../utils/features";

export const newServiceController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { name, photo, description } = req.body;
    const { id } = req.query;

    const existingService = await Service.findOne({ name });
    let provider = await Provider.findOne({ distributorId: id });

    if (existingService) {
      if (provider) {
        const isServiceLinked = provider.serviceIds.some(
          (serviceId) => serviceId.toString() === existingService._id.toString()
        );

        if (isServiceLinked) {
          return res.status(200).json({
            success: false,
            message: "You already have this service.",
          });
        }

        provider.serviceIds.push(existingService._id);
        await provider.save();
      } else {
        provider = await Provider.create({
          distributorId: id,
          serviceIds: [existingService._id],
        });
      }

      return res.status(200).json({
        success: true,
        message: "Service linked to distributor.",
      });
    }
    let PhotoUrl;
    if (photo) {
      const photoBase64 = photo.split(",")[1];
      if (photoBase64) {
        const uploadedPhoto = await uploadToCloudinary([
          {
            buffer: Buffer.from(photoBase64, "base64"),
            mimetype: photo.split(";")[0].split(":")[1],
          },
        ]);
        PhotoUrl = uploadedPhoto[0].url;
      }
    }

    const newService = await Service.create({
      name,
      photo: PhotoUrl,
      description,
    });

    if (provider) {
      provider.serviceIds.push(newService._id);
      await provider.save();
    } else {
      provider = await Provider.create({
        distributorId: id,
        serviceIds: [newService._id],
      });
    }

    return res.status(201).json({
      success: true,
      message: "Service created and linked to provider successfully.",
      service: newService,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getDistributorServicesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id, page = 1 } = req.query;
    const limit = 12;
    const skip = (Number(page) - 1) * limit;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Distributor ID is required",
      });
    }

    const distributor = await Provider.findOne({ distributorId: id }).populate({
      path: "serviceIds",
      model: "Service",
    });

    if (!distributor) {
      return res.status(200).json({
        success: false,
        message: "You haven't added any services yet",
      });
    }

    const totalServices = distributor.serviceIds.length;
    const paginatedServices = distributor.serviceIds.slice(skip, skip + limit);

    const totalPages = Math.ceil(totalServices / limit);

    return res.status(200).json({
      success: true,
      services: paginatedServices,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.log(error);
  }
};

export const getUserDistributorServicesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { pincode } = req.body;
    const page = Number(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const distributor = await User.findOne({
      pincode,
      role: { $in: ["admin", "distributor"] },
    });

    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: "Distributor not found",
      });
    }

    const services = await Provider.findOne({
      distributorId: distributor._id,
    }).populate({
      path: "serviceIds",
      model: "Service",
      options: {
        limit,
        skip,
      },
    });

    if (!services || !services.serviceIds.length) {
      return res.status(404).json({
        success: false,
        message: "No services found",
      });
    }

    const provider = await Provider.findOne({
      distributorId: distributor._id,
    });

    if (!provider || !provider.serviceIds.length) {
      return res.status(404).json({
        success: false,
        message: "No services found",
      });
    }

    const totalServices = provider.serviceIds.length;

    return res.status(200).json({
      success: true,
      services: services.serviceIds,
      currentPage: page,
      totalPages: Math.ceil(totalServices / limit),
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllServicesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const services = await Service.find().skip(skip).limit(limit);

    const totalServices = await Service.countDocuments();

    const servicesWithProviders = await Promise.all(
      services.map(async (service) => {
        const providers = await Provider.find({
          serviceIds: service._id,
        }).populate<{
          distributorId: { name: string; phoneNumber: number };
        }>({
          path: "distributorId",
          model: "User",
          select: "name phoneNumber",
        });

        const providerDetails = providers.map((provider) => ({
          name: provider.distributorId?.name,
          phoneNumber: provider.distributorId?.phoneNumber,
        }));

        return {
          ...service.toObject(),
          providers: providerDetails,
        };
      })
    );

    return res.status(200).json({
      success: true,
      services: servicesWithProviders,
      currentPage: page,
      totalPages: Math.ceil(totalServices / limit),
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteServiceController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Service not Found",
      });
    }

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    await Provider.updateMany(
      { serviceIds: id },
      { $pull: { serviceIds: id } }
    );

    await Service.findByIdAndDelete(id, { new: true });

    return res.status(200).json({
      success: true,
      message: "Service deleted Successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteDistributorServiceController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.query;
    const serviceId = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Distributor ID is required.",
      });
    }

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required.",
      });
    }

    const distributor = await Provider.findOne({ distributorId: id });
    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: "Distributor not found.",
      });
    }

    const updateResult = await Provider.updateOne(
      { distributorId: id, serviceIds: serviceId },
      { $pull: { serviceIds: serviceId } }
    );

    if (updateResult.modifiedCount === 0) {
      // to check how many docs were modified as updateOne returns some modifiedCount
      return res.status(404).json({
        success: false,
        message: "Service not linked to this distributor or already unlinked.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service unlinked successfully from the distributor.",
    });
  } catch (error) {
    console.log(error);
  }
};

export const searchServicesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { search, pincode } = req.query;

    if (!search || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Search not found",
      });
    }

    const distributor = await User.findOne({
      pincode,
      role: { $in: ["admin", "distributor"] },
    });

    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: "No distributor found for this pincode",
      });
    }

    const providers = await Provider.find({
      distributorId: distributor._id,
    }).populate({
      path: "serviceIds",
      model: "Service",
      match: {
        name: { $regex: search, $options: "i" },
      },
    });

    const availableServices = providers
      .flatMap((provider) => provider.serviceIds)
      .filter((service) => service);

    if (availableServices.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No services found matching the search term in this pincode",
      });
    }

    return res.status(200).json({
      success: true,
      services: availableServices,
    });
  } catch (error) {
    console.log(error);
  }
};
