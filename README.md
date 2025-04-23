# 🎓 Eğitim Seminerlerinde Katılımcı Takip Sistemi

Bu proje, seminerler ve katılımcıların takibini yapmak için geliştirilmiş basit bir Node.js uygulamasıdır. Katılımcıların girişte işaretlenmesi, seminer bazlı katılım oranlarının gösterilmesi ve JSON/PDF raporlarının alınabilmesini sağlar.

## 🚀 Özellikler

- Seminer ve katılımcı kaydı
- Katılım işaretleme (girişte kayıt)
- Katılım oranının hesaplanması
- Katılım geçmişi raporu (JSON ve PDF formatında)
- Temel kullanıcı arayüzü (Handlebars)
- MSSQL veri tabanı kullanımı

## 🛠️ Teknolojiler

- Node.js
- Express.js
- Express-Handlebars
- MSSQL (`mssql` NPM paketi ile)
- PDFKit (PDF raporları için)
- HTML/CSS (basit stillerle)

## 🏗️ Veritabanı Tabloları

### 1. `seminars`
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INT | Seminer ID |
| title | NVARCHAR | Seminer başlığı |
| date | DATE | Seminer tarihi |

### 2. `participants`
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INT | Katılımcı ID |
| name | NVARCHAR | Katılımcı adı |

### 3. `attendance`
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INT | Katılım ID |
| seminar_id | INT | Seminer ID (FK) |
| participant_id | INT | Katılımcı ID (FK) |
| timestamp | DATETIME | Katılım zamanı |

## 🔍 API Uç Noktaları

| Yöntem | URL | Açıklama |
|--------|-----|----------|
| `POST` | `/attendance` | Katılım işaretleme |
| `GET` | `/seminars/:id/stats?format=json/pdf` | Katılım raporu (JSON veya PDF) |

## ▶️ Projeyi Çalıştırma

1. Gerekli modülleri yükleyin:
   ```bash
   npm install
