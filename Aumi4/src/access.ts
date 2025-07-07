import { RoleCodes } from '@/constants';

export default function (initialState) {
    const role = initialState?.currentUser?.role;

    console.log(role)

    return {
        rootCan: role === RoleCodes.root,
        adminCan: [RoleCodes.root, RoleCodes.admin].includes(role),
        memberCan: [RoleCodes.root, RoleCodes.admin, RoleCodes.member].includes(role),
    };
}