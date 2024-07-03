**Vehicle API**

API ini dibuat untuk mengelola data kendaraan, termasuk merek, tipe, tahun, model, dan daftar harga. API mengikuti kaidah RESTful API yang baik dan benar, dengan implementasi authentication, pagination, dan filter.

**Tech Stack**

* Node.Js
* MySQL
  
**Fitur Utama**

* **RESTful API:** GET all, GET by ID, POST, PATCH, DELETE
* **Authentication:** Diperlukan token untuk mengakses API
* **Pagination:** Metadata total, limit, offset
* **Filter:** Filter data berdasarkan kolom yang tersedia
* **Field Audit:** created_at ,updated_at, & deleted_at untuk setiap entity
* **Authorization:** User Admin dapat mengubah dan menghapus data, sedangkan user non admin hanya dapat menampilkan data
* **Postman Collection:** Tersedia untuk memudahkan pengujian API
* **Deploy:** Deploy hasil ke server untuk nilai plus

**ERD**

![ERD Vehicle](https://github.com/fadlifathurrahman/Vehicles/assets/110813489/250f09eb-6b24-4b02-aac3-a7482e955e52)


**Hubungan antar tabel:**

* **Users:** Menyimpan informasi pengguna, termasuk nama dan status admin.
* **Vehicle_brands:** Menyimpan informasi merek kendaraan, termasuk nama.
* **Vehicle_types:** Menyimpan informasi tipe kendaraan, termasuk nama dan merek kendaraan.
* **Vehicle_years:** Menyimpan informasi tahun kendaraan.
* **Vehicle_models:** Menyimpan informasi model kendaraan, termasuk nama dan tipe kendaraan.
* **Pricelists:** Menyimpan daftar harga kendaraan, termasuk kode, harga, tahun kendaraan, dan model kendaraan.

**Catatan**

* API ini masih dalam pengembangan, dan fitur baru akan ditambahkan secara berkala.
