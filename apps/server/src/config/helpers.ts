import { Notification } from "../notifications/notification.entity";
import { UserRole } from "../enums/userRole.enum";
import { NotificationsService } from "../notifications/notifications.service";
import { ethers } from "ethers";
import { Operation } from "../operations/operation.entity";
import {
  IntendedTo,
  notificationsIntendedTo,
  NotificationsMessages,
} from "../../../../libs/shared/src/lib/notifications";

export function getIntendedTo(
  map: IntendedTo
): Pick<Notification, "intendedRoles" | "intendedRoutes"> {
  const intendedRoles = [] as UserRole[];
  const intendedRoutes = [] as string[];
  Object.entries(map).forEach(([role, routeName]) => {
    intendedRoles.push(role as UserRole);
    intendedRoutes.push(routeName);
  });
  return { intendedRoutes, intendedRoles };
}

/**
 * Create a notification. with the given message and intendedTo roles.
 * @param service
 * @param operation
 * @param message
 * @param intendedTo
 */
export function createNotification(
  service: NotificationsService,
  operation: Operation,
  message?: NotificationsMessages
) {
  const notification = new Notification();
  const operationMessage = operation.notification ?? message;
  const intendedTo = notificationsIntendedTo[operationMessage];
  notification.message = operationMessage;
  Object.assign(notification, getIntendedTo(intendedTo));
  notification.reference = operation.reference;
  if (intendedTo[UserRole.NOTAIRE]) {
    notification.ownerId = operation.owner;
  }
  notification.promoteurs = Array.from(
    new Set([...operation.sellers, ...operation.buyers])
  );
  return service.create(notification);
}

export function generateWalletInfo(): {
  privateKey: string;
  walletAddress: string;
} {
  const wallet = ethers.Wallet.createRandom();
  return {
    privateKey: wallet.privateKey,
    walletAddress: wallet.address,
  };
}

export function omit<T extends object>(target: T, props: (keyof T)[]) {
  const propsSet = new Set(props);
  const result = {} as T;
  for (const key of Object.keys(target)) {
    if (!propsSet.has(key as keyof T)) {
      result[key] = target[key];
    }
  }
  return result;
}
