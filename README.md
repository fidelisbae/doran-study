# PokeChat

WebSocket 통신을 이용한 포켓몬을 실시간 교환하는 채팅 서비스.
<br />
<br />

## 🖥️ 프로젝트 소개

포켓몬스터 라는 게임을 즐기기 위해 필요한 건 포켓몬 교환입니다.  
이 교환을 활발하고 편하게 이용하기 위해 채팅 서비스를 생각하게 되었습니다.
<br />
<br />

## ⏳ 개발 기간

22.01 ~ 22.02 `리팩토링 진행중`
<br />
<br />

## ⚙ 개발 환경

- 보일러 플레이트 제작 : [NestJS](https://nest.com), typescript
- NodeJS - 16.17.1
- Database :
  - MySQL - latest
  - Redis - latest
- ORM :
  - typeORM - 0.3
- Docker - 20.10.18
  <br />
  <br />
  <br />

## 🎮 주요 기능

### 🟢 [로그인](backend/src/apis/auth/)

- [회원가입](backend/src/apis/users/user.controller.ts)

  > 회원가입시에는 정해진 양식에 따라 정보를 기입하고, 이를 체크해 가입을 시켜준다.  
  > 가입 시 password와 같은 민감한 정보는 hash 처리를 통해 데이터를 저장한다.

  - [테스트 코드 작성](backend/src/apis/users/test/)

- [유저 검증](backend/src/apis/users/user.service.ts)
- [로그인 시 Access_Token 및 Refresh_Token 생성](backend/src/apis/auth/auth.service.ts)

  > Access_Token 탈취 와 같은 보안 위험성을 보완 하고자 HttpOnly 쿠키에 Refresh_Token 관리하고 Access_Token의 유효기간을 짧게 둔다.

### 🌐 WebSocket

- Socket 연결 시 로그인 유저 검증
- [채팅방 생성하고 입장하기](backend/src/commons/socket/socket.gateway.ts)

  > WebSocket은 양방향 데이터 통신 방법이다.  
  > Socket.io 라이브러리를 이용하여 채팅방을 구현하였다.  
  > 로그인 유저의 채팅방 생성 및 입장 가능. 방 떠나기 및 유저 추방 추가.

  <br />
  <br />

  ## [📖 작업하며 학습 내용](https://fan-smile-44f.notion.site/efd4a9ab82c34d05865f1cd70f9295a1)

- [🐋 Docker 설정](https://yadoran.oopy.io/e9f0962c-c235-4124-b969-ca406b969867)
- [WebSocket](https://yadoran.oopy.io/22d37fee-46ea-4621-abf8-3fd3a8ba9879)
- Swagger에서 Header에 token을 싣는 방법.
  ```
   new DocumentBuilder().addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token or refresh-token',
    )
  ```
- [✅ 테스트 코드 작성](https://yadoran.oopy.io/c8e8248a-b25c-4f5b-bab9-931ff29036e1)
- [Token 검증 데코레이터](https://fan-smile-44f.notion.site/29362dd89a8f49cfbb6c51dd5fc7ec8c)
