export const weeklyMenus = [
    {
        id: 1,
        menu: "Ikan Bumbu Kuning",
        date: "Senin, 12 Januari 2026",
        day: "Senin",
        status: "Aman",
        components: [
            "Nasi putih 150g",
            "Ikan kuning 90g",
            "Tumis buncis 60g",
            "Air mineral 200ml",
            "Jeruk 1 buah"
        ],
        risk: [
            "Tidak ditemukan risiko signifikan.",
            "Tekstur lembut, relatif aman untuk anak sensitif."
        ],
        riskDetails: {
            alergi: [
                "Tidak ada bahan dengan potensi alergi tinggi."
            ],
            tekstur: [
                "Ikan empuk → aman untuk siswa sensitif tekstur."
            ],
            porsi: [
                "Semua porsi gizi berada dalam rentang standar MBG."
            ]
        },
        recommendation: ["Tidak memerlukan tindakan khusus, menu aman untuk semua kelompok siswa.", "Jangan lupa minum air mineral sebelum dan sesudah makan."],
        nutrition: [
            { label: "Kalori Total", value: "590 kkal" },
            { label: "Karbohidrat", value: "76g" },
            { label: "Protein", value: "28g" },
            { label: "Lemak", value: "14g" },
            { label: "Gula", value: "10g" },
            { label: "Serat", value: "7g" },
            { label: "Sodium", value: "680mg" }
        ]
    },
    {
        id: 2,
        menu: "Soto Ayam Bening",
        date: "Selasa, 13 Januari 2026",
        day: "Selasa",
        status: "Perlu Perhatian",
        components: [
            "Nasi putih 150g",
            "Soto bening 200ml",
            "Ayam rebus 50g",
            "Telur Rebus 1 butir",
            "Jeruk 1 buah"
        ],
        risk: [
            "Perlu cek apakah menggunakan jeroan.",
            "Suun harus dimasak lembut agar mudah dikunyah"
        ],
        riskDetails: {
            alergi: [
                "Telur rebus adalah alergen umum bagi sebagian siswa."
            ],
            tekstur: [
                "Suun berisiko menyebabkan tersedak jika tidak dipotong pendek.",
                "Pastikan ayam disuwir halus."
            ],
            porsi: [
                "Kandungan sodium dalam kuah soto cenderung tinggi."
            ]
        },
        recommendation:[ "Pastikan suun dipotong pendek dan dimasak lunak. Sediakan alternatif lauk bagi siswa yang alergi telur."],
        nutrition: [
            { label: "Kalori Total", value: "380 kkal" },
            { label: "Karbohidrat", value: "45g" },
            { label: "Protein", value: "18g" },
            { label: "Lemak", value: "8g" },
            { label: "Gula", value: "4g" },
            { label: "Serat", value: "2g" },
            { label: "Sodium", value: "820mg" }
        ]
    },
    {
        id: 3,
        menu: "Tahu Bacem Telur",
        date: "Rabu, 14 Januari 2026",
        day: "Rabu",
        status: "Tidak Aman",
        components: [
            "Nasi putih 150g",
            "Tahu bacem 2 potong",
            "Telur dadar 1 butir",
            "Sayur sop 1 mangkuk",
            "Pepaya 100g"
        ],
        risk: [
            "Rasa bacem terlalu manis",
            "Wortel rawan keras.",
            "Pastikan telur dadar tidak terlalu berminyak."
        ],
        riskDetails: {
            alergi: [
                "Tahu (kedelai) dan Telur merupakan alergen utama."
            ],
            tekstur: [
                "Potongan wortel pada sop berisiko keras dan sulit dikunyah.",
                "Tekstur tahu bacem cenderung kenyal/liat."
            ],
            porsi: [
                "Kadar gula sangat tinggi dari bumbu bacem.",
                "Telur dadar mengandung minyak berlebih."
            ]
        },
        recommendation: ["Menu tidak disarankan. Ganti teknik masak bacem dengan kukus/rebus dan pastikan sayuran dimasak hingga benar-benar lunak."],
        nutrition: [
            { label: "Kalori Total", value: "450 kkal" },
            { label: "Karbohidrat", value: "52g" },
            { label: "Protein", value: "21g" },
            { label: "Lemak", value: "14g" },
            { label: "Gula", value: "22g" },
            { label: "Serat", value: "3g" },
            { label: "Sodium", value: "410mg" }
        ]
    }
];