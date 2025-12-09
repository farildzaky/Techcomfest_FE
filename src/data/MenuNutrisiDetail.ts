// src/data/MenuAkgData.ts

export const detailedMenus = [
    {
        id: 1, // Terhubung ke "Ikan Bumbu Kuning"
        menuName: "Nasi Ikan Bumbu Kuning", // <-- DITAMBAHKAN
        totalCalories: 590,                 // <-- DITAMBAHKAN
        totalWeight: "448 gram/porsi",
        description: "Menu Nasi Ikan Bumbu Kuning adalah sajian seimbang yang kaya akan protein hewani. Pengolahan ikan dengan bumbu kuning memberikan antioksidan alami, dipadukan dengan tumis buncis sebagai sumber serat.",
        // Data untuk Diagram Donat (Total harus 100%)
        chartData: {
            karbo: 55,
            protein: 20,
            lemak: 15,
            lainnya: 10
        },
        // Data Persentase AKG
        akg: [
            { label: "Karbohidrat", value: "28% Nilai Harian" },
            { label: "Protein", value: "35% Nilai Harian" },
            { label: "Lemak", value: "15% Nilai Harian" },
            { label: "Gula", value: "5% Nilai Harian" },
            { label: "Serat", value: "25% Nilai Harian" },
            { label: "Sodium", value: "12% Nilai Harian" },
        ],
        // Rincian Nutrisi Per Komponen
        components: [
            {
                name: "Nasi Putih",
                weight: "150g",
                calories: "195 kkal",
                nutrients: { karbo: "42g", protein: "4g", lemak: "0.4g", gula: "0g", serat: "0.5g", sodium: "0mg" }
            },
            {
                name: "Ikan Bumbu Kuning",
                weight: "90g",
                calories: "140 kkal",
                nutrients: { karbo: "2g", protein: "22g", lemak: "5g", gula: "1g", serat: "1g", sodium: "320mg" }
            },
            {
                name: "Tumis Buncis",
                weight: "60g",
                calories: "45 kkal",
                nutrients: { karbo: "8g", protein: "2g", lemak: "1g", gula: "2g", serat: "3g", sodium: "150mg" }
            },
            {
                name: "Jeruk",
                weight: "1 buah",
                calories: "45 kkal",
                nutrients: { karbo: "11g", protein: "1g", lemak: "0g", gula: "9g", serat: "2g", sodium: "0mg" }
            }
        ]
    },
    {
        id: 2, // Terhubung ke "Soto Ayam Bening"
        menuName: "Soto Ayam Bening",       // <-- DITAMBAHKAN
        totalCalories: 380,                 // <-- DITAMBAHKAN
        totalWeight: "450 gram/porsi",
        description: "Menu Soto Ayam memberikan hidrasi yang baik lewat kuah beningnya. Perlu perhatian khusus pada kandungan sodium dalam kuah dan tekstur suun agar aman dikonsumsi.",
        chartData: {
            karbo: 45,
            protein: 25,
            lemak: 20,
            lainnya: 10
        },
        akg: [
            { label: "Karbohidrat", value: "20% Nilai Harian" },
            { label: "Protein", value: "25% Nilai Harian" },
            { label: "Lemak", value: "18% Nilai Harian" },
            { label: "Gula", value: "2% Nilai Harian" },
            { label: "Serat", value: "10% Nilai Harian" },
            { label: "Sodium", value: "45% Nilai Harian" },
        ],
        components: [
            {
                name: "Nasi Putih",
                weight: "150g",
                calories: "195 kkal",
                nutrients: { karbo: "42g", protein: "4g", lemak: "0.4g", gula: "0g", serat: "0.5g", sodium: "0mg" }
            },
            {
                name: "Soto Ayam (Kuah+Isi)",
                weight: "250g",
                calories: "170 kkal",
                nutrients: { karbo: "15g", protein: "13g", lemak: "7g", gula: "1g", serat: "0.5g", sodium: "580mg" }
            },
            {
                name: "Telur Rebus",
                weight: "1 butir",
                calories: "78 kkal",
                nutrients: { karbo: "0.6g", protein: "6g", lemak: "5g", gula: "0.6g", serat: "0g", sodium: "62mg" }
            },
            {
                name: "Jeruk",
                weight: "1 buah",
                calories: "45 kkal",
                nutrients: { karbo: "11g", protein: "1g", lemak: "0g", gula: "9g", serat: "2g", sodium: "0mg" }
            }
        ]
    },
    {
        id: 3, // Terhubung ke "Tahu Bacem Telur"
        menuName: "Tahu Bacem Telur",       // <-- DITAMBAHKAN
        totalCalories: 450,                 // <-- DITAMBAHKAN
        totalWeight: "420 gram/porsi",
        description: "Menu ini memiliki kandungan gula yang cukup tinggi dari proses bacem dan lemak jenuh dari telur dadar. Sayur sop memberikan sedikit serat penyeimbang.",
        chartData: {
            karbo: 50,
            protein: 15,
            lemak: 25,
            lainnya: 10
        },
        akg: [
            { label: "Karbohidrat", value: "30% Nilai Harian" },
            { label: "Protein", value: "18% Nilai Harian" },
            { label: "Lemak", value: "35% Nilai Harian" },
            { label: "Gula", value: "40% Nilai Harian" },
            { label: "Serat", value: "15% Nilai Harian" },
            { label: "Sodium", value: "10% Nilai Harian" },
        ],
        components: [
            {
                name: "Nasi Putih",
                weight: "150g",
                calories: "195 kkal",
                nutrients: { karbo: "42g", protein: "4g", lemak: "0.4g", gula: "0g", serat: "0.5g", sodium: "0mg" }
            },
            {
                name: "Tahu Bacem",
                weight: "2 potong",
                calories: "110 kkal",
                nutrients: { karbo: "12g", protein: "8g", lemak: "4g", gula: "15g", serat: "1g", sodium: "120mg" }
            },
            {
                name: "Telur Dadar",
                weight: "1 butir",
                calories: "110 kkal",
                nutrients: { karbo: "1g", protein: "7g", lemak: "9g", gula: "0g", serat: "0g", sodium: "90mg" }
            },
            {
                name: "Pepaya",
                weight: "100g",
                calories: "39 kkal",
                nutrients: { karbo: "10g", protein: "0.6g", lemak: "0.1g", gula: "6g", serat: "1.7g", sodium: "1mg" }
            }
        ]
    }
];