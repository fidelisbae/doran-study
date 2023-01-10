# doran-study

> 공부한 내용을 정리합니다. 왜 사용했는지, 어떤 생각을 갖고 했는 지는 README에 기록합니다.

## `2023.01.03`

### 🐋 Docker 설정

- `Dockerfile`
  : 도커 파일은 이미지를 직접 생성할 때 쓰인다.  
  여기에 쓰이는 명령어 한줄씩을 레이어 라고 부르고, 명령어에 따라 실행되는 것이 다르다.

  도커 파일을 만든 방법 및 이유에 대해 다음에 기재한다.  
  https://fan-smile-44f.notion.site/docker-e7343d1c57934b9fa8c8d7e39e590db5

  > 이유 요약: mysql status 설정 및 nestjs 서버를 띄우기 위해서.

- `Docker compose 설정`
  : 직접 만든 이미지 파일을 써서 컨테이너 구축에 사용한다.  
   `MySQL`은 특히 utf8 설정을 하지 않으면 한글이 깨지는 현상이 발생할 수 있기에 초기 셋팅을 위해 이미지 파일을 만들었다.  
   `NestJS`는 추후 배포를 염두해 두고 서버를 띄우기 위해 컨테이너를 함께 묶어서 구동시켰다.  
   `.env`를 활용해서 민감한 정보를 git과 같은 오픈된 장소에 올리지 않기 위해 연결해서 사용하였다.

<br />
<br/>

### 🚨 Error

> 환경변수를 사용하는데 어려움이 발생했다.

https://fan-smile-44f.notion.site/Docker-MySQL-env-9a0f368a50db4835a18b95f9e7124ee3

<br />
<br/>

## `2023.01.09`

### 💚️ Swagger

- REST API를 설계, 빌드, 문서화 및 사용하는데 도움이 되는 OpenAPI 사양을 중심으로 구축된 오픈 소스 도구 세트.
- 테스트를 할 수 있는 UI를 제공하므로써 편리하다.
- `utils > swaggerSetup.util.ts` 를 이용해 Swagger를 `main.ts`에서 호출해서 사용한다.
  > 가독성 적인 면과 코드 수정시에 용이할 수 있도록 파일을 분리해서 사용했다.

<br />

### 👨‍🔧️ 회원가입 API 생성

- 회원가입을 할 때는 최소한의 정보만을 input으로 받기로 했다.
- entity에서 primaryKey로 회원의 id를 채택했다.

  ```
  채택 이유
  1. primaryColumn 을 사용해 보고 싶었다.
  2. 회원의 id 역시 고유한 값(중복되지 않는 값)이기에 사용할 수 있다고 생각했다.

  단점
  1. 회원의 id가 primaryKey 이므로 유출 시 uuid에 비해 보안이 더 취약할 것이라고 생각한다.
  (uuid는 회원의 id나 기타 정보를 통해 찾게되는 랜덤한 고유Key이지만
  회원의 id값이 primaryKey 일 경우, 바로 노출되는 부분이기에
  uuid에 비해 거칠 과정이 더 적다는 부분에서 보안이 취약할 것이라고 판단했다.)
  ```

- 닉네임을 필요로 하는 이유는 id가 primaryKey 이기에 그대로 노출해서 사용하는 것보다 다른 정보를 사용하는 것이 낫다고 생각하기도 했고, 채팅에 노출되는 값은 보편적으로 닉네임을 선호하는 편이기에 가입 시 추가하도록 했다.
- 비밀번호는 hashing을 거친 비밀번호를 DB에 저장해서 사용한다.
  > 이는 오리지널 비밀번호를 그대로 DB에 저장했을 때,  
  > 해킹 시 데이터가 고스란히 노출되는 위험이 있는데 Hashing된 비밀번호를 저장해두면  
  > 해킹 시에도 비밀번호가 어느정도 보안이 되기에 필요하다.(Hashing을 푸는 과정이 필요)
- ID와 닉네임은 중복을 허용하지 않기 위해, 기존 DB에 해당 데이터와 같은 데이터가 있는지를 판별한다.

### 😄️ Login Api 생성

- 로그인 시 회원의 ID와 비밀번호가 유효한 값인지 검증이 필요하다.
  > ID로는 DB에 저장되어 있는 유저 정보인지를,  
  > 비밀번호는 Hashing된 비밀번호와 일치하는 지 확인해서 로그인 시켜줘야한다.
- 로그인이 정상적으로 되었을 경우에는 회원만이 갖을 수 있는 권한을 이용하기 위한 `AccessToken` 발급을 해, 각각의 서비스를 이용할 수 있게 해주어야 한다.
  <br />
  <br />

## `2023.01.10`

### 💚️ Swagger

- swagger를 이용해 Header에 token을 싣으려면 다음과 같이 추가해야할 부분이 있다.
  ```
    .addBearerAuth(
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
  > 사용할 토큰의 종류와 싣을 부분을 설정해야 Swagger에서 Token을 사용할 수 있다.
- 추가적인 설정으로는 `swaggerOption`이 있다.
  ```
  SwaggerModule.setup(_,_,_, {
    swaggerOptions: { persistAuthorization: true },
  });
  ```
  > persistAuthorization을 true로 설정하면 새로고침을 해도 입력해둔 accessToken이 휘발되지 않는다.
