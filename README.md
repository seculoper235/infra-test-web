# Infra Test Web Server

Infra Development 레포지토리에 필요한 Frontend 서버 소스코드 입니다

---
## 관련 저장소
* **인프라**\
https://github.com/seculoper235/Kubernetes_Development


* **Backend**\
https://github.com/seculoper235/infra-test-api

---
## 📝 frontend Image
다음 git 저장소의 README.md 참고\
**https://github.com/seculoper235/infra-test-web**

### Frontend 이미지 생성
```shell
// 소스코드 빌드
npm build

// 이미지 생성
docker build -t infra-frontend:1.0 -f ./docker/Dockerfile .
```
