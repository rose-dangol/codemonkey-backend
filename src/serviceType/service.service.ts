// import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
// import { PrismaService } from "src/prisma/prisma.service";
// import { ServiceTypeDto } from "./dto/serviceType.dto";

// @Injectable()
// export class ServiceTypeService{
//     constructor(private prisma: PrismaService) { }

//     async addServiceType(serviceTypePayload: ServiceTypeDto){
//         const serviceType = await this.prisma.serviceType.findUnique({
//             where: {
//                 serviceName: serviceTypePayload.serviceName,
//             },
//         });
//         if (serviceType) {
//             throw new ConflictException('Service Type already exists');
//         }
//         return this.prisma.serviceType.create({
//             data: serviceTypePayload,
//         });
//     }


//     async getAllServiceType(){
//         return this.prisma.serviceType.findMany()
//     }

//     async getServiceTypeById(id: string){
//         const serviceType = this.prisma.serviceType.findUnique({
//             where: {
//                 id: id,
//             },
//         });
//         if (!serviceType) {
//             throw new NotFoundException('Service Type not found');
//         }
//         return serviceType;
//     }

//     // async updateServiceType(id: string, serviceTypePayload: ServiceTypeDto){
//     //     return this.prisma.serviceType.update({
//     //         where: {
//     //             id: id,
//     //         },
//     //         data: serviceTypePayload,
//     //     });
//     // }

//     // async deleteServiceType(id: string){
//     //     return this.prisma.serviceType.delete({
//     //         where: {
//     //             id: id,
//     //         },
//     //     });
//     // }
// }
