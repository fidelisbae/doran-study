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

22.01 ~ 22.01 `1월->2월로 연장`
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

- [채팅방 생성하고 입장하기](backend/src/commons/socket/socket.gateway.ts)

  > WebSocket은 양방향 데이터 통신 방법이다.  
  > Socket.io 라이브러리를 이용하여 채팅방을 구현하였다.  
  > 로그인 유저의 채팅방 입장 및 닉네임 출력은 구현중에 있다.

  <br />
  <br />

  ## 📖 작업하며 학습 내용

- [🐋 Docker 설정](https://fan-smile-44f.notion.site/docker-e7343d1c57934b9fa8c8d7e39e590db5)
- [프로토콜(양방향 통신인 Websocket과 그 이외의 통신규약)](https://fan-smile-44f.notion.site/Protocol-API-7ea172d4e91f46439f2c856e36fc562a)
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
  - [✅ 테스트 코드 작성](https://velog.io/@doll950904/NestJS-%ED%9A%8C%EC%9B%90%EA%B0%80%EC%9E%85-API%EC%9D%98-TestCode%EB%A5%BC-%EC%9E%91%EC%84%B1%ED%95%98%EC%9E%90with.Jest)
