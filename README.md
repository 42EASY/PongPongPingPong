# 핑퐁게임 서비스, 퐁퐁핑퐁🏓

**퐁퐁핑퐁**은 간편하게 접속하여 다양한 방식으로 즐길 수 있는 핑퐁게임 서비스입니다. 
<br />
실시간 게임과 채팅 기능을 경험할 수 있습니다.

<br />

### ⚙️ 기술 스택
|구분| 기술명 |
|--|--|
|Front-End | ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) |
|Back-End | ![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) 	![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white) |
|협업 툴 |![Slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white) ![Notion](https://img.shields.io/badge/Notion-%23000000.svg?style=for-the-badge&logo=notion&logoColor=white) ![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white) |
|서비스 빌드 환경 | ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)|
|디자인 | ![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white) |


<br />

## 팀원 정보
### 👩‍💻 팀원 구성
| 이하현 | 정성은 | 오현진 | 김은비 | 이주은 |
|:--:|:--:|:--:|:--:|:--:|
| <img src="https://github.com/42EASY/PongPongPingPong/assets/85945788/a018675e-55af-4f7e-b567-db96519d2539" width="200"> | <img src="https://github.com/42EASY/PongPongPingPong/assets/85945788/0549d722-7047-41f1-9b26-ac29735a0ce0" width="200">  | <img src="https://github.com/42EASY/PongPongPingPong/assets/85945788/832c9aa3-64fd-4edd-9346-592314435a01" width="200">  |<img src="https://github.com/42EASY/PongPongPingPong/assets/85945788/64ed2d22-4f48-4bbe-9268-08e41c8d7898" width="200"> |<img src="https://github.com/42EASY/PongPongPingPong/assets/85945788/4876034f-f23b-43f4-a1c8-418ab4ac8311" width="200"> |
| Front-End | Front-End | Front-End | Back-End | Back-End |
| [madylin](https://github.com/im-madylin) | [seongeun](https://github.com/eunn43) | [hyunjin](https://github.com/oh-hyunjin)| [eunbi](https://github.com/eunbi9n)| [jueun](https://github.com/dlwndms0812)|

<br />


## 기술적 도전
 ### 🌝 Front-End
 - 웹 프론트엔드 개발에 대한 이해도를 높이고 기초부터 숙달하기 위하여 Vanilla JS과 CSS3을 사용했습니다.
 - 페이지 로딩 시간을 줄여 사용자 경험을 향상시키고, 웹소켓을 사용하기 위하여 SPA (Single Page Application)를 구현했습니다.
 - 모달의 작동 방식을 직접 파악하고 맞춤형 디자인으로 사용하기 위하여 외부 라이브러리에 의존하지 않고 모달 직접 설계 및 구현했습니다.
 - 사용자 경험을 향상시키고 웹 애플리케이션의 보안을 강화하기 위하여 OAuth 2.0을 사용하여 간편 로그인 기능을 구현했습니다.
 - 게임 플레이어 간의 실시간 동기화와 사용자의 사이트 접속 상태, 그리고 채팅을 위하여 웹소켓을 사용했습니다. 
 - 추가적인 보안 단계를 통해 사용자 계정을 보호하기 위하여 Google Authenticator 앱 연동을 통한 2차 인증을 구현했습니다.
 - 물리 법칙을 기반으로 패들과 공의 움직임을 계산하여 핑퐁게임의 2p를 구현했습니다.
 - 동적인 사용자 경험을 제공하기 위하여 무한 스크롤 기능을 구현했습니다.

 ### 🌚 Back-End
-   OAuth 2.0를 활용하여 로그인 기능을 구현하여 사용자의 편리하고 안전한 인증 절차를 제공했습니다.
-   refresh token을 사용하여 보안성을 강화하고 사용자 경험을 향상시켰습니다.
-   JWT 커스텀 인증 데코레이터를 구현하여, API 요청 시 사용자 인증 과정을 간소화하고 보안성 확보했습니다.
-   소켓 프로그래밍을 이용하여 실시간 채팅 및 알림 기능을 구현. 소켓 최초 연결 시 사용자 인증을 수행함으로써 채팅 시스템의 보안을 확보했습니다.
- Nginx를 활용하여 HTTPS 프로토콜을 구성, 웹사이트와 사용자 간의 데이터 전송을 암호화하여 보안을 강화했습니다.
-   노말 모드 및 토너먼트 모드를 지원하는 WebSocket을 이용하여 실시간으로 친구를 초대하고 게임 매칭을 수행했습니다.
-   WebSocket을 활용한 실시간 데이터 교환으로 빠른 반응 속도 및 높은 동시성을 지원하는 게임 플레이 환경을 구현했습니다.
-   모든 서비스(프론트엔드, 백엔드, PostgreSQL, Redis, Nginx)를 Docker 컨테이너에서 관리 및 실행하여 빌드 과정을 통합하고 자동화했습니다.


<br />

## 서비스 기능
### [ 로그인 화면 ]
![ts06](https://github.com/42EASY/PongPongPingPong/assets/85945788/e281e0af-e5a1-4022-9dfb-bb5aa270f8ed)

-   **간편 로그인:**
    -   42서울의 계정을 이용하여 간편하고 안전하게 로그인할 수 있습니다.


### [ 설정 화면 ]
<img src="https://github.com/42EASY/PongPongPingPong/assets/85945788/50f5a12f-d142-4465-ad9e-50b12881f5f9" width="500" > <img src="https://github.com/42EASY/PongPongPingPong/assets/85945788/633795c4-fc32-4ad2-9e2c-2eb504de6752" width="500" > 

-   **프로필 설정:**
    -   프로필 이미지, 닉네임, 2차인증 여부를 설정할 수 있습니다.


### [ 메인 화면 ]
<img src="https://github.com/42EASY/PongPongPingPong/assets/85945788/c9eb531c-469f-4d89-b92c-6260701b9ab5" width="500" > <img src="https://github.com/42EASY/PongPongPingPong/assets/85945788/9bcc6e03-8fae-453c-b86c-51c1ca5af73a" width="500" > 

-   **사용자 정보:**
    -   사용자의 프로필 이미지, 닉네임, 게임 기록을 확인할 수 있으며, 친구 추가/차단, 게임 초대, 메세지 기능을 수행할 수 있습니다.
-   **경기 전적:**
    -   사용자의 일반 경기 전적을 확인할 수 있습니다.
-   **토너먼트 전적:**
    -   사용자의 토너먼트 경기 전적을 확인할 수 있습니다.


### [ 채팅 화면 ]
<img src="https://github.com/42EASY/PongPongPingPong/assets/85945788/af4466c1-9b97-4e0f-ad2d-cc8a9fee5a6e" width="500" > <img src="https://github.com/42EASY/PongPongPingPong/assets/85945788/71e452b3-d8a4-4a30-a5a6-afeaab6f82cd" width="500" > 


-   **채팅하기:**
    -   현재 접속 중인 사용자와 채팅을 주고 받고, 해당 사용자의 프로필을 확인할 수 있습니다.
-   **알림 봇:**
    -   게임 초대, 토너먼트 게임 상대, 토너먼트 게임 결과를 알림 받을 수 있습니다.


### [ 친구 화면 ]
<img src="https://github.com/42EASY/PongPongPingPong/assets/85945788/7d29b0ac-8e5f-4241-9cdd-b9581dda88de" width="500" > <img src="" width="500" > 

-   **친구 목록:**
    -   친구 목록을 확인할 수 있고, 접속 여부를 확인할 수 있습니다.
    -  친구 목록 내 친구를 검색할 수 있습니다.
-   **차단 목록:**
    -   차단 목록을 확인할 수 있습니다.
    -  차단 목록 내 친구를 검색할 수 있습니다.


### [ 일반 게임 매칭 화면 ]


-   **일반 게임:**
    -   게임하러 가기 버튼을 클릭 후 대전자를 찾습니다.
    - 초대를 통해 원하는 상대방과 게임할 수 있습니다.


### [ 토너먼트 게임방 화면 ]

-   **토너먼트 게임:**
    - 게임하러 가기 버튼을 클릭 후 대전자를 찾습니다.
    - 초대를 통해 원하는 상대방과 게임할 수 있습니다.
    - 대전자들의 승률을 기준으로 상대가 매칭되고, 대진표를 확인할 수 있습니다.

### [ 게임 화면 ]


-   **게임:**
    -   클래식, 스피드 옵션에 따라 공의 속도를 다르게 즐길 수 있습니다.
-   **토너먼트:**
	- 준결승 종료 후 결승 진출자는 게임방에서 잠시 대기합니다.



