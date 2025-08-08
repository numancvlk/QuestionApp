# 🤷 REACT NATIVE - PROGRAMMING LANGUAGE QUESTION APP 

## 🚀 Proje Hakkında 

Bu mobil uygulama, React Native (TypeScript ile), Express.js (TypeScript ile) ve MongoDB teknolojilerini kullanarak geliştirilmiştir. Uygulama, kullanıcıların gelişmek istediği programlama dillerindeki hakimiyetlerini arttırmaları için sorular sorar. Bu sayede kullanıcı bolca pratik ile programlama dillerindeki hakimiyetini arttırabilir.

## ✨ Özellikler 

* **🗺️ Öğrenme Yolu:** Öğrenme yolunuzdaki dersleri ve ilerlemenizi takip edin.
* **⚡️ Hızlı Yarışma:** Belirlediğiniz zorluk seviyesinde hızlı, rastgele sorularla bilginizi anında test edin.
* **⏳ Zamana Karşı Yarışma:** 60 saniye içinde rastgele seviyelerdeki en çok soruyu doğru cevaplamaya çalışın. 
* **🎲 Rastgele Soru Yarışması:** Seçtiğiniz sayıda rastgele soruyu çözerek bilgilerinizi tazeleyin.
* **🏆 Liderlik Tablosu** Dersleri tamamladıkça puan kazanın ve diğer insanlar ile liderlik tablolarında rekabet edin.

---
### ❗Önemli Notlar
Kayıt olduğunuz ilk kullanıcıya database üzerinden admin rolünü vermeniz gerekmektedir! Yeni programlama dili dersi eklemek veya bu dersler içerisine modüller eklemek isterseniz ilgili URL'ye POST isteği atmanız gerekmektedir. 
---
### 📸 Ekran Görüntüleri 
| Login Ekranı | Kayıt Ekranı | 
| :---------------------------------: | :------------------------: |
| <img width="540" height="1110" alt="2LoginScreen" src="https://github.com/user-attachments/assets/98131144-901f-48b9-b5ba-78f0163f4aa1" /> | <img width="540" height="1110" alt="1RegisterScreen" src="https://github.com/user-attachments/assets/dc7d46a6-8100-4972-87a1-4666e8222919" />


 | Programlama Dili Seçme Ekranı | Öğrenme Yolu Ekranı | 
| :---------------------------------: | :------------------------: |
| <img width="540" height="1110" alt="3İlk Dil Seçme Ekranı" src="https://github.com/user-attachments/assets/bec9d3b6-4698-4894-8868-d529e566acbc" /> | <img width="540" height="1110" alt="4LearningPath" src="https://github.com/user-attachments/assets/fa2bb39c-2ca7-45c3-9e57-7ed12c66b96e" />


 | Quiz Başlangıç Ekranı | Quiz Ekranı (DOĞRU CEVAP) | 
| :---------------------------------: | :------------------------: |
| <img width="540" height="1110" alt="5IntroScreen" src="https://github.com/user-attachments/assets/f17ac029-ddd4-4835-88a2-656184ef2ddf" /> | <img width="540" height="1110" alt="6DoğruCevap" src="https://github.com/user-attachments/assets/68f022ed-e8bc-4fcd-b4ca-f6c3d9693c12" />


 | Quiz Ekranı (YANLIŞ CEVAP) | Quiz Bitiş Ekranı | 
| :---------------------------------: | :------------------------: |
|  <img width="540" height="1110" alt="7YanlisCevap" src="https://github.com/user-attachments/assets/05373d33-681e-4b2c-b523-9a1080ce4a4e" /> | <img width="540" height="1110" alt="8BitişEkranı" src="https://github.com/user-attachments/assets/13c69724-aa06-4ad5-acdc-e46c3a600fe4" />


 | Hızlı Yarışma Ekranı | Zamana Karşı Yarışma Ekranı | 
| :---------------------------------: | :------------------------: |
|  <img width="540" height="1110" alt="9HızlıYarışmaEkranı" src="https://github.com/user-attachments/assets/0e82f978-761b-4b48-b361-c1ced976510b" /> | <img width="540" height="1110" alt="10Zamanlı Yarışma" src="https://github.com/user-attachments/assets/57cc2ecb-bd42-4142-8aa2-97b470833d63" />


 | Rastgele Soru Yarışması | Liderlik Tablosu Ekranı | 
| :---------------------------------: | :------------------------: |
| <img width="540" height="1110" alt="11Rastgele Soru" src="https://github.com/user-attachments/assets/8222bed9-3de7-490d-974e-ed077144c24d" /> | <img width="540" height="1110" alt="12Leaderboard - 1" src="https://github.com/user-attachments/assets/9811b7e7-45fc-450b-b36a-3f878d9e3b68" />


---
## 🚀 Kurulum ve Çalıştırma 

1.  **Gereksinimler:**
    * Bilgisayarınızda **Node.js**'in kurulu olması gerekmektedir.

### Adımlar 

1.  **Bağımlılıkları Yükleyin:**
      **Frontend ve backend klasörleri için ayrı ayrı bu adımı uygulamanız gerekmektedir**
    ```bash
    npm install
    ```

3.  **Ortam Değişkenlerini Ayarlayın:**
    Bu proje, database bağlantı stringleri gibi hassas bilgiler kullanır. Bu bilgileri doğrudan kodunuza yazmaktan kaçınmalısınız.
    Projenin backend klasöründe ve frontend klasörününe, **`.env`** dosyanızı oluşturun.
    
    **BACKEND .env dosyası**
      - PORT = Uygulamanın backend'e istek göndereceği adres.
      - MONGO_URI = MongoDB üzerinden aldığınız size özel olan connection string.
      - JWT_SECRET = Kimlik doğrulama işlemleri için gereklidir.

    **FRONTEND .env dosyası**
      - API_URL = Uygulamanızın kendi BACKEND SUNUCUSUNA bağlanacağı ana adres (API_URL/api şeklinde)
      
5.  **Uygulamayı Başlatın:**
        **Backend klasörüne gidip sunucuyu başlatın.**
    ```bash
    npm run dev
    ```
    
      **Frontend klasörüne gidip uygulamayı başlatın.**
    ```bash
    npx expo
    ```
    * Uygulama başarıyla başlatıldığında, emülatörde çalışmaya başlayacaktır. 🎉
---

### Bu proje, sadece portföy amacıyla ve ticari bir amaç gütmeden paylaşılmaktadır.
### This project is shared solely for portfolio purposes and without any commercial intent.
