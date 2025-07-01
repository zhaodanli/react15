declare namespace API {

    // =============== pageList ===============
    export interface PageListResponse<T> {
        code: number;
        data: Page[];
        msg: string;
    }

    export interface Page {
        dsc: string;
        page_id: string;
        page_name: string;
    }

    interface Result_PageInfo__ {
        code?: number;
        message?: string;
        data?: PageList_<T>;
    }

    export interface PageList_<T> {
        list?: T[];
        total?: number;
    }

    // =============== eventList ===============
    interface Result_EventInfo__ {
        success?: boolean;
        errorMessage?: string;
        data?: EventList_;
    }

    interface EventList_ {
        list?: T[];
        total?: number;
    } 

    export interface ListResponse<T> {
        data?: ListData<T>;
        errorCode: string;
        errorMessage: string;
        errorType: number;
        success?: boolean;
    }

    export interface ListData<T> {
        list?: T[];
        total?: number;
    }


    export interface User {
        id?: number;
        password?: string;
        phone?: string;
        username?: string;
        role?: string;
    }
    export interface SigninUser {
        username?: string;
        password?: string;
    }
    export interface SignupUser {
        password?: string;
        phone?: string;
        username?: string;
        role_id?: number;
    }

    /* eslint-disable */
    // 该文件由 OneAPI 自动生成，请勿手动修改！
    interface PageInfo {
        /** 
    1 */
        current?: number;
        pageSize?: number;
        total?: number;
        list?: Array<Record<string, any>>;
    }

    interface PageInfo_UserInfo_ {
        /** 
    1 */
        current?: number;
        pageSize?: number;
        total?: number;
        list?: Array<UserInfo>;
    }

    interface Result {
        success?: boolean;
        errorMessage?: string;
        data?: Record<string, any>;
    }

    interface Result_PageInfo_UserInfo__ {
        success?: boolean;
        errorMessage?: string;
        data?: PageInfo_UserInfo_;
    }

    interface Result_UserInfo_ {
        success?: boolean;
        errorMessage?: string;
        data?: UserInfo;
    }

    interface Result_string_ {
        success?: boolean;
        errorMessage?: string;
        data?: string;
    }

    type UserGenderEnum = 'MALE' | 'FEMALE';

    interface UserInfo {
        id?: string;
        name?: string;
        /** nick */
        nickName?: string;
        /** email */
        email?: string;
        gender?: UserGenderEnum;
    }

    interface UserInfoVO {
        name?: string;
        /** nick */
        nickName?: string;
        /** email */
        email?: string;
    }

    type definitions_0 = null;
}
