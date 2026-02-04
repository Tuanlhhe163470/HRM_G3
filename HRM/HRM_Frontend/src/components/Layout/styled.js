"use client";

import styled from "styled-components";
const arrowIconPath = "/images/arrow-down.svg";

export const StyleMenuAccount = styled.div`
  .menu-account {
    background: #f3f6fc;
    padding: 6px;
    border-radius: 20px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    margin-top: 10px;
    .btn-logout {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 8px;
      font-size: 14px !important;
      font-weight: 600;
      span {
        svg {
          width: 20px;
          height: 20px;
          path {
            fill: rgb(237, 17, 23);
          }
        }
      }
    }
    .btn-function {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 8px;
      font-size: 14px !important;
      span {
        svg {
          width: 20px;
          height: 20px;
          path {
            fill: #9a9a9a;
          }
        }
      }
    }
    .strok-btn-function {
      span {
        svg {
          width: 20px;
          height: 20px;
          path {
            fill: #9a9a9a;
            stroke: #9a9a9a;
          }
        }
      }
    }
    .ant-dropdown-menu-item {
      background: #fff !important;
      padding: 5px 0px;
    }
    .ant-dropdown-menu-item:hover {
      background: #f5f5f5 !important;
    }
    .ant-dropdown-menu {
      position: relative !important;
      width: 100% !important;
      padding: 0 !important;
      box-shadow: unset;
      background: none;
      .account-infor {
        background: #fff;
        padding: 10px;
        border-radius: 20px 20px 3px 3px;
        margin-bottom: 3px;
        .ant-divider {
          margin: 10px 0px;
        }
        .infor {
          margin-bottom: 8px;
        }
        .sumary-infor-user {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          flex-direction: column;
          height: 100%;
        }
      }
      .account-function {
        background: #fff;
        padding: 10px;
        border-radius: 3px;
        margin-bottom: 3px;
      }
      .account-logout {
        background: #fff;
        padding: 10px;
        border-radius: 3px 3px 20px 20px;
      }
    }
  }
`;

export const AdminMenuStyled = styled.div`
  position: sticky;
  top: 85px;
  .ant-menu-item,
  .ant-menu-submenu {
    top: 0px;
    padding: 6px 0px !important;
  }
  .ant-menu-submenu-selected::after,
  .ant-menu-item-selected::after {
    background: unset !important;
  }
  .ant-menu-sub.ant-menu-inline {
    background: transparent;
  }
  .ant-menu-item:hover .ant-menu-title-content {
    color: #154398 !important;
    font-weight: 600;
  }
  .ant-menu-submenu-title:hover .ant-menu-title-content {
    color: #154398 !important;
    font-weight: 600;
  }
  .ant-menu-item:hover .ant-menu-title-content {
    color: #154398 !important;
    font-weight: 600 !important;
  }
  .ant-menu-item-only-child .ant-menu-title-content {
    color: #212529;
    font-weight: 400 !important;
  }
  .ant-menu-item-selected .ant-menu-title-content {
    font-weight: 600 !important;
  }
  .ant-menu-item .ant-menu-title-content,
  .ant-menu-submenu-title .ant-menu-title-content {
    color: #212529;
    font-weight: 600;
  }
  .ant-menu-submenu {
    top: 0px !important;
  }
  .ant-menu-item {
    padding-left: 24px !important;
  }
  .ant-menu-item-selected .ant-menu-title-content {
    color: #154398;
    font-weight: 600;
  }
  .ant-menu-sub .ant-menu-item {
    margin-left: -12px;
    width: 100%;
    padding-left: 73px !important;
    border-radius: 0px 8px 8px 0px;
  }
  .ant-menu-item-selected {
    background: #ffffff !important;
    border-radius: 0px 8px 8px 0px;
    box-shadow: 2px 0px 3px rgb(0 0 0 / 5%);
    width: calc(100% - 12px);
  }
  .ant-menu-submenu-selected .ant-menu-item-selected {
    background: #ffffff;
    box-shadow: 2px 0px 3px rgb(0 0 0 / 5%);
  }
  .ant-menu-item-group-title {
    font-style: italic;
    color: #212529;
    font-weight: 600;
    margin-left: 15px;
  }
  .menu-antd-admin {
    max-height: calc(100vh - 90px);
    background: #f7f7f7;
    border-radius: 8px;
    width: 270px;
    min-height: calc(100vh - 90px);
    overflow: hidden auto;
    &::-webkit-scrollbar {
      width: 0px;
    }
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      box-shadow: unset;
      margin: 5px 0px;
    }
    &::-webkit-scrollbar-thumb {
      background: #c5ced9;
      border-radius: 30px;
    }
    &.ant-menu-inline-collapsed {
      width: 80px;
      .ant-menu-submenu-selected {
        background-color: #69b1ff;
        .ant-menu-item-icon {
          color: #fff;
          svg path {
            fill: #fff;
          }
        }
      }
      .ant-menu-submenu-title {
        display: flex;
        align-items: center;
      }
      .ant-menu-item-icon {
        font-size: 20px !important;
        min-width: 20px !important;
      }
    }
  }
`;

export const CardStyled = styled.div`
  width: 400px;
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0px 0px 30px rgba(21, 66, 151, 0.1);
  .box-image {
    width: 60px;
    height: 60px;
    border: 1px solid #dddddd;
    border-radius: 4px;
    display: flex;
    align-items: center;
    overflow: hidden;
  }
  .ant-dropdown-menu {
    box-shadow: unset;
  }
  .ant-dropdown-menu-item {
    padding: 5px 20px;
    margin: 5px -20px;
  }
  .box-footer {
    box-shadow: 0px -3px 20px rgba(21, 66, 151, 0.05);
    margin: 12px -20px -20px -20px;
    padding: 15px;
  }
`;

export const LayoutStyled = styled.div`
  position: relative;
  .fl-input-radius {
    .ant-input-group > .ant-input:first-child,
    .ant-input-group-addon:first-child {
      border-radius: 24px;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    .ant-input-search > .ant-input-group > .ant-input-group-addon:last-child .ant-input-search-button {
      border-radius: 0 24px 24px 0;
    }
  }
  .hover-menu:hover {
    span {
      color: #ed1117 !important;
      svg path {
        fill: #ed1117;
      }
    }
  }
  .div-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .account-infor-avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
  .account-infor-sumary-border {
    border-radius: 20px;
    border: 1px solid #a3a3a3;
    gap: 2px;
    padding: 2.5px 2.5px;
  }
  .account-infor-sumary-border-admin {
    border-radius: 20px;
    border: 1px solid #a3a3a3;
    gap: 2px;
    padding: 2.5px 2.5px;
  }
  .account-infor-sumary {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 2px;
    span {
      svg path {
        fill: #000;
      }
      .fullname {
        font-size: 12px !important;
        color: #a3a3a3;
        font-weight: 600;
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
      }
      .account {
        font-size: 12px !important;
        color: #a3a3a3;
        font-style: italic;
      }
    }
  }
  .spacement_pp {
    height: 16px;
    position: sticky;
    top: 70px;
    background: #fff;
    z-index: 10;
  }
  .admin-header {
    position: sticky;
    top: 0;
    z-index: 100;
    filter: drop-shadow(0px 1px 10px rgba(0, 0, 0, 0.1));
  }
  .breadcrumb-header {
    box-shadow: inset 0 5px 10px #ebebeb;
    padding: 15px 0;
    background: #f7f7f7;
  }
  .box-breadcrumb-header {
    background-color: #fff;
  }
  .background-animation {
    position: fixed;
    bottom: 40px;
    left: 40px;
    background-color: #c7dcff;
    width: 100px;
    height: 100px;
    border-radius: 50px;
    animation: Background-zoom 2.3s ease-in-out infinite;
  }
  .chatbot {
    position: fixed;
    bottom: 40px;
    right: 40px;
  }
  .phone-animate {
    position: fixed;
    bottom: 62px;
    left: 62px;
    animation: App-logo-spin 1s ease-in-out infinite;
  }
  @keyframes Background-zoom {
    0%,
    100% {
      transform: rotate(0) scale(0.7) skew(1deg);
      opacity: 0.2;
    }
    50% {
      transform: rotate(0) scale(1) skew(1deg);
      opacity: 0.2;
    }
  }
  @keyframes App-logo-spin {
    0%,
    100%,
    50% {
      transform: rotate(0) scale(1) skew(1deg);
    }
    10%,
    30% {
      transform: rotate(-25deg) scale(1) skew(1deg);
    }
    20%,
    40% {
      transform: rotate(25deg) scale(1) skew(1deg);
    }
  }
  .name-branch {
    text-transform: uppercase;
    color: #154398;
  }
  .online-support {
    font-weight: 600;
    font-size: 12px;
    line-height: 15px;
    color: #a3a3a3;
  }
  .hotline {
    color: #ed1117;
    font-size: 14px;
  }
  .ant-layout-header {
    background-color: white;
    padding: 0px;
    height: auto;
  }
  .ant-layout {
    background-color: #fff;
  }
  .flex-end-col {
    display: flex;
    justify-content: flex-end;
  }
  .ant-badge-multiple-words {
    padding: 0px 5px;
  }
  .ant-scroll-number-only-unit {
    font-size: 10px;
  }
  .ant-badge-count {
    font-size: 10px;
  }
  .layout-action {
    margin-left: 0px !important;
    margin-right: 0px !important;
    margin-top: 10px !important;
    width: 100%;
    justify-content: space-between;
    @media only screen and (min-width: 700px) {
      margin: unset !important;
      width: unset;
      justify-content: unset;
      margin-top: 0px !important;
    }
  }
  .header-admin-menu {
    color: #154398;
    font-weight: 600;
  }
`;

export const CustomMenuStyled = styled.div`
  .ant-menu-submenu-selected::after {
    border-bottom: unset !important;
    /* Sử dụng trực tiếp đường dẫn tương đối từ public */
    background: url("/images/arrow-down.svg") no-repeat;
    content: "";
    width: 10px;
    height: 6px;
    bottom: 0px;
    right: 0;
    position: absolute;
    left: 0;
    margin: auto;
  }
  .ant-menu-item,
  .ant-menu-submenu {
    padding: 0px 12px !important;
    top: 11px;
  }
  .ant-menu-submenu-popup .ant-menu-vertical .ant-menu-submenu {
    border-bottom: 1px dashed #e1e1e1;
    &:last-child {
      border-bottom: unset;
    }
  }
  .ant-menu-submenu:hover::after {
    border-bottom: unset !important;
  }
  .ant-menu-horizontal {
    border-bottom: 0px;
  }
  .ant-menu-title-content {
    color: #154398;
    font-weight: 600;
  }
  .ant-menu-item:hover::after {
    border-bottom: unset !important;
  }
  .ant-menu-submenu:hover {
    color: transparent !important;
  }
  .ant-menu-submenu::after {
    border: unset !important;
  }
  .ant-menu-item-selected .ant-menu-title-content {
    color: #ed1117 !important;
  }
  .ant-menu-submenu-selected .ant-menu-submenu-title span {
    color: #ed1117 !important;
  }
  .ant-menu-item:hover .ant-menu-title-content {
    color: #ed1117 !important;
  }
  .ant-menu-overflow-item:hover .ant-menu-submenu-title .ant-menu-title-content {
    color: #ed1117 !important;
  }
  .ant-menu-item-selected::after {
    border-bottom: unset !important;
    background: url("/images/arrow-down.svg") no-repeat;
    content: "";
    width: 10px;
    height: 6px;
    bottom: 0px;
    right: 0;
    position: absolute;
    left: 0;
    margin: auto;
  }
  .ant-menu-item-active::after {
    border-bottom: unset !important;
  }
  .ant-menu-horizontal > .ant-menu-item::after {
    transition: unset !important;
  }
  &.menu-no-arrow {
    .ant-menu-item-selected::after {
      display: none;
    }
  }
`;

export const StyleRegisterModal = styled.div`
  .ant-input {
    border-radius: 4px !important;
  }
  .remember {
    display: flex;
    justify-content: end;
    align-items: center;
  }
  .forget-pass {
    font-weight: 600;
    font-size: 14px;
    line-height: 100%;
    text-align: right;
    color: #154398;
  }
  .btn-register {
    width: 100%;
    height: 56px !important;
    background: #154398;
    border-radius: 4px !important;
  }
  .register {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    .link-login {
      font-weight: 600;
      color: red;
      cursor: pointer;
    }
  }
  .ant-checkbox-inner {
    border: 2px solid #666666;
  }
  .center {
    width: 100%;
    justify-content: center;
    padding-top: 24px;
    padding-bottom: 24px;
  }
  .or {
    ant-col {
      position: relative;
    }
    .ant-btn:hover,
    .ant-btn:focus {
      color: #212529 !important;
      border-color: #d2e3fc !important;
      background: rgba(66, 133, 244, 0.04) !important;
    }
    .ant-btn {
      position: absolute;
      right: 0;
      height: 32px !important;
      border-radius: 4px !important;
      span {
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: "Google Sans", arial, sans-serif;
        font-weight: 500;
        font-size: 14px;
        text-align: center;
        color: #212529;
        span {
          svg {
            width: 23px;
            height: 23px;
          }
          margin-right: 10px;
        }
      }
    }
    #signInDiv {
      iframe {
        width: 100%;
        display: flex;
        justify-content: center;
      }
    }
  }
`;

export const StyleLoginModal = styled.div`
  .ant-input {
    border-radius: 4px !important;
  }
  .remember {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .forget-pass {
    font-weight: 600;
    font-size: 14px;
    line-height: 100%;
    text-align: right;
    margin-bottom: 20px;
    color: #154398;
    display: flex;
    justify-content: end;
  }
  .btn-login {
    width: 100%;
    height: 56px !important;
    background: #154398;
    border-radius: 4px !important;
  }
  .register {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    .link-regis {
      font-weight: 600;
      cursor: pointer;
      color: red;
    }
  }
  .ant-checkbox-inner {
    border: 2px solid #666666;
    border-radius: 0px;
  }
  .space-between {
    justify-content: space-between;
    align-items: flex-start;
  }
  .ant-checkbox-wrapper {
    font-weight: 400;
    font-size: 14px;
    color: #666666;
  }
  .center {
    width: 100%;
    justify-content: center;
    padding-top: 24px;
    padding-bottom: 24px;
  }
  .or {
    ant-col {
      position: relative;
    }
    .ant-btn:hover,
    .ant-btn:focus {
      color: #212529 !important;
      border-color: #d2e3fc !important;
      background: rgba(66, 133, 244, 0.04) !important;
    }
    .ant-btn {
      position: absolute;
      right: 0;
      height: 32px !important;
      border-radius: 4px !important;
      span {
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: "Google Sans", arial, sans-serif;
        font-weight: 500;
        font-size: 14px;
        text-align: center;
        color: #212529;
        span {
          svg {
            width: 23px;
            height: 23px;
          }
          margin-right: 10px;
        }
      }
    }
    #signInDiv {
      iframe {
        width: 100%;
        display: flex;
        justify-content: center;
      }
    }
  }
`;

export const StyleSelectRegisterModal = styled.div`
  .div-modal-select,
  .modal-select {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modal-select {
    background: #ffffff;
    box-shadow: 0px 4px 10px rgba(21, 67, 152, 0.1);
    border-radius: 8px;
    width: 263px;
    height: 199px;
    flex-direction: column;
    position: relative;
    &::after {
      content: "";
      display: block;
      width: 100%;
      height: 0px;
      background: linear-gradient(90deg, #154297 0%, #ed1e24 100%);
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      position: absolute;
      bottom: 0;
      left: 0;
    }
    &:hover::after {
      height: 4px;
    }
    &:hover {
      box-shadow: 0px 2px 20px rgba(21, 67, 152, 0.2);
      border-bottom: 4px solid linear-gradient(90deg, #154297 0%, #ed1e24 100%);
    }
    .title {
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      color: #154398;
      margin-top: 24px;
    }
  }
`;

export const UserInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  .user-information {
    padding-right: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    .user-name {
      font-weight: 600;
      color: ${({ theme }) => theme.white};
      margin-bottom: 8px;
      width: max-content;
      line-height: 1;
    }
    .user-role {
      color: ${({ theme }) => theme.white};
      font-size: 13px;
      margin-bottom: 0px;
      text-align: right;
      line-height: 1;
    }
  }
  .style-avt {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: 1px solid #fff;
  }
  .notification_count {
    svg path {
      stroke: #a3a33a;
    }
  }
  .div-notification_count {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;