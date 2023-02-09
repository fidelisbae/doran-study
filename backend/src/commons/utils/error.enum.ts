export const ERROR = Object.freeze({
  ///////////////////////////////////////////////////////////////////
  // user //
  // prettier-ignore
  USER_UPDATE_INFO_SUCCEED: { status: 201, message: '정보 수정이 완료되었습니다.' },
  // prettier-ignore
  USER_UPDATE_INFO_FAILED: { status: 201, message: '정부 수정이 실패되었습니다.' },
  // prettier-ignore
  NOT_A_PASSWORD_FORM: {status: 400, message: '유효한 비밀번호 양식이 아닙니다.'},
  // prettier-ignore
  ALREADY_EXIST_USER: { status: 400, message: '이미 존재하는 id 혹은 닉네임 입니다.' },
  // prettier-ignore
  INVALID_USER_ID: { status: 400, message: '사용자 ID 정보가 유효하지 않습니다.' },
  // prettier-ignore
  INVALID_USER_PASSWORD: { status: 400, message: '사용자 PASSWORD 정보가 유효하지 않습니다.'},
  // prettier-ignore
  INVALID_USER_INFO: {status: 400, message: '일치하는 정보가 없습니다. 다시 입력해주세요.'},

  ///////////////////////////////////////////////////////////////////
  // auth //
  REQUIRED_LOGIN: { status: 501, message: '로그인이 필요합니다.' },
  NOT_EXIST_USER: { status: 400, message: '존재하지 않는 회원입니다.' },
  SESSION_SUCCESS_PASSED: { status: 201, message: '로그아웃에 성공했습니다.' },
  SESSION_DESTROY_FAILED: { status: 404, message: '로그아웃에 실패했습니다.' },
  // prettier-ignore
  CAN_NOT_LOGOUT: { status: 500, message: '이미 로그아웃 처리가 되어있습니다.' },
  // prettier-ignore
  SUCCEED_DELETED_ACCOUNT: { status: 200, message: '회원 탈퇴되었습니다. 이용해주셔서 감사합니다.' },
  // prettier-ignore
  FAILED_DELETED_ACCOUNT: { status: 500, message: '회원 탈퇴에 실패했습니다. 다시 시도해주세요.' },

  ///////////////////////////////////////////////////////////////////
  // socket //
  CAN_NOT_CREATED_ROOM: { status: 500, message: '방 생성에 실패했습니다.' },
  DOES_NOT_EXIST_ROOM: { status: 400, message: '존재하지 않는 방입니다.' },
  CAN_NOT_ENTER_ROOM: { status: 500, message: '방 입장에 실패했습니다.' },
  DO_NOT_HAVE_PERMISSION: { status: 400, message: '권한이 없습니다.' },

  ///////////////////////////////////////////////////////////////////
  // chat //
  // prettier-ignore
  CAN_NOT_FIND_CHAT: { status: 400, message: '조건에 일치하는 방을 찾을 수 없습니다.' },
});
