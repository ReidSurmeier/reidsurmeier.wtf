"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import TextScatterLoader from "./TextScatterLoader";
import { txtTiles, imgTiles } from "../data";

type Lang = "en" | "de" | "fr" | "ko" | "id" | "zh" | "ja";

function TypewriterText({ children, delay = 0, speed = 40 }: { children: string; delay?: number; speed?: number }) {
  const [charCount, setCharCount] = useState(0);
  const [started, setStarted] = useState(false);
  const text = children;
  const FADE_WINDOW = 4;
  const totalSteps = Array.from(text).length + FADE_WINDOW;

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started || charCount >= totalSteps) return;
    const timer = setTimeout(() => setCharCount((c) => c + 1), speed);
    return () => clearTimeout(timer);
  }, [started, charCount, totalSteps, speed]);

  const chars = Array.from(text);
  return (
    <span>
      {chars.map((char, i) => {
        let opacity = 0;
        if (i < charCount - FADE_WINDOW) opacity = 1;
        else if (i < charCount) opacity = (charCount - i) / FADE_WINDOW;
        return (
          <span key={i} style={{ opacity, transition: "opacity 0.2s ease", whiteSpace: char === " " ? "pre" : undefined }}>{char}</span>
        );
      })}
    </span>
  );
}

const printsImages = [
  "/plotter%20drawings/1.jpg",
  "/plotter%20drawings/2.jpg",
  "/plotter%20drawings/3.jpg",
  "/plotter%20drawings/4.jpg",
  "/plotter%20drawings/5.jpg",
  "/plotter%20drawings/6.jpg",
  "/plotter%20drawings/8.jpg",
];

const paintingImages = [
  "/painting/betterversion%202.jpg",
  "/painting/betterversion%203.jpg",
  "/painting/betterversion%204.jpg",
  "/painting/betterversion%205.jpg",
  "/painting/iu%5Bp.jpg",
];

const printsCaptions: Record<Lang, Array<{ title: string; date: string; medium: string; dimensions: string }>> = {
  en: [
    { title: "Untitled I", date: "2026", medium: "Pen plotter drawing on paper", dimensions: "18 × 24 in." },
    { title: "Untitled II", date: "2026", medium: "Pen plotter drawing on paper", dimensions: "18 × 24 in." },
    { title: "Untitled III", date: "2026", medium: "Pen plotter drawing on paper", dimensions: "18 × 24 in." },
    { title: "Untitled IV", date: "2026", medium: "Pen plotter drawing on paper", dimensions: "18 × 24 in." },
    { title: "Untitled V", date: "2026", medium: "Pen plotter drawing on paper", dimensions: "18 × 24 in." },
    { title: "Untitled VI", date: "2026", medium: "Pen plotter drawing on paper", dimensions: "18 × 24 in." },
    { title: "Untitled VIII", date: "2026", medium: "Pen plotter drawing on paper", dimensions: "18 × 24 in." },
  ],
  de: [
    { title: "Ohne Titel I", date: "2026", medium: "Stiftplotterzeichnung auf Papier", dimensions: "45,7 × 61 cm" },
    { title: "Ohne Titel II", date: "2026", medium: "Stiftplotterzeichnung auf Papier", dimensions: "45,7 × 61 cm" },
    { title: "Ohne Titel III", date: "2026", medium: "Stiftplotterzeichnung auf Papier", dimensions: "45,7 × 61 cm" },
    { title: "Ohne Titel IV", date: "2026", medium: "Stiftplotterzeichnung auf Papier", dimensions: "45,7 × 61 cm" },
    { title: "Ohne Titel V", date: "2026", medium: "Stiftplotterzeichnung auf Papier", dimensions: "45,7 × 61 cm" },
    { title: "Ohne Titel VI", date: "2026", medium: "Stiftplotterzeichnung auf Papier", dimensions: "45,7 × 61 cm" },
    { title: "Ohne Titel VIII", date: "2026", medium: "Stiftplotterzeichnung auf Papier", dimensions: "45,7 × 61 cm" },
  ],
  fr: [
    { title: "Sans titre I", date: "2026", medium: "Dessin au traceur à plume sur papier", dimensions: "45,7 × 61 cm" },
    { title: "Sans titre II", date: "2026", medium: "Dessin au traceur à plume sur papier", dimensions: "45,7 × 61 cm" },
    { title: "Sans titre III", date: "2026", medium: "Dessin au traceur à plume sur papier", dimensions: "45,7 × 61 cm" },
    { title: "Sans titre IV", date: "2026", medium: "Dessin au traceur à plume sur papier", dimensions: "45,7 × 61 cm" },
    { title: "Sans titre V", date: "2026", medium: "Dessin au traceur à plume sur papier", dimensions: "45,7 × 61 cm" },
    { title: "Sans titre VI", date: "2026", medium: "Dessin au traceur à plume sur papier", dimensions: "45,7 × 61 cm" },
    { title: "Sans titre VIII", date: "2026", medium: "Dessin au traceur à plume sur papier", dimensions: "45,7 × 61 cm" },
  ],
  ko: [
    { title: "무제 I", date: "2026", medium: "종이 위 펜 플로터 드로잉", dimensions: "45.7 × 61 cm" },
    { title: "무제 II", date: "2026", medium: "종이 위 펜 플로터 드로잉", dimensions: "45.7 × 61 cm" },
    { title: "무제 III", date: "2026", medium: "종이 위 펜 플로터 드로잉", dimensions: "45.7 × 61 cm" },
    { title: "무제 IV", date: "2026", medium: "종이 위 펜 플로터 드로잉", dimensions: "45.7 × 61 cm" },
    { title: "무제 V", date: "2026", medium: "종이 위 펜 플로터 드로잉", dimensions: "45.7 × 61 cm" },
    { title: "무제 VI", date: "2026", medium: "종이 위 펜 플로터 드로잉", dimensions: "45.7 × 61 cm" },
    { title: "무제 VIII", date: "2026", medium: "종이 위 펜 플로터 드로잉", dimensions: "45.7 × 61 cm" },
  ],
  id: [
    { title: "Tanpa Judul I", date: "2026", medium: "Gambar pen plotter di atas kertas", dimensions: "45,7 × 61 cm" },
    { title: "Tanpa Judul II", date: "2026", medium: "Gambar pen plotter di atas kertas", dimensions: "45,7 × 61 cm" },
    { title: "Tanpa Judul III", date: "2026", medium: "Gambar pen plotter di atas kertas", dimensions: "45,7 × 61 cm" },
    { title: "Tanpa Judul IV", date: "2026", medium: "Gambar pen plotter di atas kertas", dimensions: "45,7 × 61 cm" },
    { title: "Tanpa Judul V", date: "2026", medium: "Gambar pen plotter di atas kertas", dimensions: "45,7 × 61 cm" },
    { title: "Tanpa Judul VI", date: "2026", medium: "Gambar pen plotter di atas kertas", dimensions: "45,7 × 61 cm" },
    { title: "Tanpa Judul VIII", date: "2026", medium: "Gambar pen plotter di atas kertas", dimensions: "45,7 × 61 cm" },
  ],
  zh: [
    { title: "无题 I", date: "2026", medium: "纸上笔式绘图仪绘画", dimensions: "45.7 × 61 厘米" },
    { title: "无题 II", date: "2026", medium: "纸上笔式绘图仪绘画", dimensions: "45.7 × 61 厘米" },
    { title: "无题 III", date: "2026", medium: "纸上笔式绘图仪绘画", dimensions: "45.7 × 61 厘米" },
    { title: "无题 IV", date: "2026", medium: "纸上笔式绘图仪绘画", dimensions: "45.7 × 61 厘米" },
    { title: "无题 V", date: "2026", medium: "纸上笔式绘图仪绘画", dimensions: "45.7 × 61 厘米" },
    { title: "无题 VI", date: "2026", medium: "纸上笔式绘图仪绘画", dimensions: "45.7 × 61 厘米" },
    { title: "无题 VIII", date: "2026", medium: "纸上笔式绘图仪绘画", dimensions: "45.7 × 61 厘米" },
  ],
  ja: [
    { title: "無題 I", date: "2026", medium: "紙にペンプロッタードローイング", dimensions: "45.7 × 61 cm" },
    { title: "無題 II", date: "2026", medium: "紙にペンプロッタードローイング", dimensions: "45.7 × 61 cm" },
    { title: "無題 III", date: "2026", medium: "紙にペンプロッタードローイング", dimensions: "45.7 × 61 cm" },
    { title: "無題 IV", date: "2026", medium: "紙にペンプロッタードローイング", dimensions: "45.7 × 61 cm" },
    { title: "無題 V", date: "2026", medium: "紙にペンプロッタードローイング", dimensions: "45.7 × 61 cm" },
    { title: "無題 VI", date: "2026", medium: "紙にペンプロッタードローイング", dimensions: "45.7 × 61 cm" },
    { title: "無題 VIII", date: "2026", medium: "紙にペンプロッタードローイング", dimensions: "45.7 × 61 cm" },
  ],
};

const paintingCaptions: Record<Lang, Array<{ title: string; date: string; medium: string; dimensions: string }>> = {
  en: [
    { title: "Untitled I", date: "2026", medium: "Ink, acrylics, inkjet transfers, enamel, pencil on paper", dimensions: "213 × 328 cm" },
    { title: "Untitled II", date: "2026", medium: "Ink, acrylics, inkjet transfers, enamel, pencil on paper", dimensions: "213 × 328 cm" },
    { title: "Untitled III", date: "2026", medium: "Ink, acrylics, inkjet transfers, enamel, pencil on paper", dimensions: "213 × 328 cm" },
    { title: "Untitled IV", date: "2026", medium: "Ink, acrylics, inkjet transfers, enamel, pencil on paper", dimensions: "213 × 328 cm" },
    { title: "Untitled V", date: "2026", medium: "Ink, acrylics, inkjet transfers, enamel, pencil on paper", dimensions: "213 × 328 cm" },
  ],
  de: [
    { title: "Ohne Titel I", date: "2026", medium: "Tinte, Acryl, Tintenstrahl-Transfers, Emaille, Bleistift auf Papier", dimensions: "213 × 328 cm" },
    { title: "Ohne Titel II", date: "2026", medium: "Tinte, Acryl, Tintenstrahl-Transfers, Emaille, Bleistift auf Papier", dimensions: "213 × 328 cm" },
    { title: "Ohne Titel III", date: "2026", medium: "Tinte, Acryl, Tintenstrahl-Transfers, Emaille, Bleistift auf Papier", dimensions: "213 × 328 cm" },
    { title: "Ohne Titel IV", date: "2026", medium: "Tinte, Acryl, Tintenstrahl-Transfers, Emaille, Bleistift auf Papier", dimensions: "213 × 328 cm" },
    { title: "Ohne Titel V", date: "2026", medium: "Tinte, Acryl, Tintenstrahl-Transfers, Emaille, Bleistift auf Papier", dimensions: "213 × 328 cm" },
  ],
  fr: [
    { title: "Sans titre I", date: "2026", medium: "Encre, acryliques, transferts jet d'encre, émail, crayon sur papier", dimensions: "213 × 328 cm" },
    { title: "Sans titre II", date: "2026", medium: "Encre, acryliques, transferts jet d'encre, émail, crayon sur papier", dimensions: "213 × 328 cm" },
    { title: "Sans titre III", date: "2026", medium: "Encre, acryliques, transferts jet d'encre, émail, crayon sur papier", dimensions: "213 × 328 cm" },
    { title: "Sans titre IV", date: "2026", medium: "Encre, acryliques, transferts jet d'encre, émail, crayon sur papier", dimensions: "213 × 328 cm" },
    { title: "Sans titre V", date: "2026", medium: "Encre, acryliques, transferts jet d'encre, émail, crayon sur papier", dimensions: "213 × 328 cm" },
  ],
  ko: [
    { title: "무제 I", date: "2026", medium: "잉크, 아크릴, 잉크젯 전사, 에나멜, 종이 위에 연필", dimensions: "213 × 328 cm" },
    { title: "무제 II", date: "2026", medium: "잉크, 아크릴, 잉크젯 전사, 에나멜, 종이 위에 연필", dimensions: "213 × 328 cm" },
    { title: "무제 III", date: "2026", medium: "잉크, 아크릴, 잉크젯 전사, 에나멜, 종이 위에 연필", dimensions: "213 × 328 cm" },
    { title: "무제 IV", date: "2026", medium: "잉크, 아크릴, 잉크젯 전사, 에나멜, 종이 위에 연필", dimensions: "213 × 328 cm" },
    { title: "무제 V", date: "2026", medium: "잉크, 아크릴, 잉크젯 전사, 에나멜, 종이 위에 연필", dimensions: "213 × 328 cm" },
  ],
  id: [
    { title: "Tanpa Judul I", date: "2026", medium: "Tinta, akrilik, transfer inkjet, enamel, pensil di atas kertas", dimensions: "213 × 328 cm" },
    { title: "Tanpa Judul II", date: "2026", medium: "Tinta, akrilik, transfer inkjet, enamel, pensil di atas kertas", dimensions: "213 × 328 cm" },
    { title: "Tanpa Judul III", date: "2026", medium: "Tinta, akrilik, transfer inkjet, enamel, pensil di atas kertas", dimensions: "213 × 328 cm" },
    { title: "Tanpa Judul IV", date: "2026", medium: "Tinta, akrilik, transfer inkjet, enamel, pensil di atas kertas", dimensions: "213 × 328 cm" },
    { title: "Tanpa Judul V", date: "2026", medium: "Tinta, akrilik, transfer inkjet, enamel, pensil di atas kertas", dimensions: "213 × 328 cm" },
  ],
  zh: [
    { title: "无题 I", date: "2026", medium: "墨水、丙烯、喷墨转印、搪瓷、纸上铅笔", dimensions: "213 × 328 厘米" },
    { title: "无题 II", date: "2026", medium: "墨水、丙烯、喷墨转印、搪瓷、纸上铅笔", dimensions: "213 × 328 厘米" },
    { title: "无题 III", date: "2026", medium: "墨水、丙烯、喷墨转印、搪瓷、纸上铅笔", dimensions: "213 × 328 厘米" },
    { title: "无题 IV", date: "2026", medium: "墨水、丙烯、喷墨转印、搪瓷、纸上铅笔", dimensions: "213 × 328 厘米" },
    { title: "无题 V", date: "2026", medium: "墨水、丙烯、喷墨转印、搪瓷、纸上铅笔", dimensions: "213 × 328 厘米" },
  ],
  ja: [
    { title: "無題 I", date: "2026", medium: "インク、アクリル、インクジェット転写、エナメル、紙に鉛筆", dimensions: "213 × 328 cm" },
    { title: "無題 II", date: "2026", medium: "インク、アクリル、インクジェット転写、エナメル、紙に鉛筆", dimensions: "213 × 328 cm" },
    { title: "無題 III", date: "2026", medium: "インク、アクリル、インクジェット転写、エナメル、紙に鉛筆", dimensions: "213 × 328 cm" },
    { title: "無題 IV", date: "2026", medium: "インク、アクリル、インクジェット転写、エナメル、紙に鉛筆", dimensions: "213 × 328 cm" },
    { title: "無題 V", date: "2026", medium: "インク、アクリル、インクジェット転写、エナメル、紙に鉛筆", dimensions: "213 × 328 cm" },
  ],
};

const paintingTranslations: Record<Lang, { aboutP1: string; aboutP2: string; aboutP3: string }> = {
  en: {
    aboutP1: "For the past few months, I have been really excited about using technologies that were used to make digital art in the 1960s, coupled with CNC machines, reprogrammed plotters, and an industrial inkjet printer originally designed for labeling shipping crates.",
    aboutP2: "This piece is a byproduct of trying to fuse analog painting and digital media processes, picturing the feeling of being stuck in a liminal, aporetic environment situated between physical and digital realities.",
    aboutP3: "",
  },
  de: {
    aboutP1: "In den letzten Monaten war ich sehr begeistert davon, Technologien zu nutzen, die in den 1960er Jahren zur Herstellung digitaler Kunst verwendet wurden, kombiniert mit CNC-Maschinen, umprogrammierten Plottern und einem industriellen Tintenstrahldrucker, der ursprünglich für die Beschriftung von Versandkisten konzipiert war.",
    aboutP2: "Dieses Werk ist ein Nebenprodukt des Versuchs, analoge Malerei und digitale Medienprozesse zu verschmelzen und das Gefühl darzustellen, in einer liminalen, aporetischen Umgebung zwischen physischer und digitaler Realität gefangen zu sein.",
    aboutP3: "",
  },
  fr: {
    aboutP1: "Au cours des derniers mois, j'ai été très enthousiaste à l'idée d'utiliser des technologies qui servaient à créer de l'art numérique dans les années 1960, associées à des machines CNC, des traceurs reprogrammés et une imprimante à jet d'encre industrielle conçue à l'origine pour l'étiquetage de caisses d'expédition.",
    aboutP2: "Cette pièce est un sous-produit de la tentative de fusionner les processus de peinture analogique et de médias numériques, illustrant le sentiment d'être coincé dans un environnement liminal et aporétique situé entre les réalités physiques et numériques.",
    aboutP3: "",
  },
  ko: {
    aboutP1: "지난 몇 달간 저는 1960년대에 디지털 아트를 만드는 데 사용되었던 기술들을 CNC 기계, 재프로그래밍된 플로터, 그리고 원래 배송 상자 라벨링용으로 설계된 산업용 잉크젯 프린터와 결합하여 사용하는 것에 큰 열정을 느끼고 있습니다.",
    aboutP2: "이 작품은 아날로그 회화와 디지털 미디어 프로세스를 융합하려는 시도의 부산물로, 물리적 현실과 디지털 현실 사이에 위치한 리미널하고 아포레틱한 환경에 갇혀 있는 느낌을 그리고 있습니다.",
    aboutP3: "",
  },
  id: {
    aboutP1: "Selama beberapa bulan terakhir, saya sangat antusias menggunakan teknologi yang digunakan untuk membuat seni digital pada tahun 1960-an, dipadukan dengan mesin CNC, plotter yang diprogram ulang, dan printer inkjet industri yang awalnya dirancang untuk pelabelan peti pengiriman.",
    aboutP2: "Karya ini merupakan hasil sampingan dari upaya menggabungkan proses lukisan analog dan media digital, menggambarkan perasaan terjebak dalam lingkungan liminal dan aporetik yang berada di antara realitas fisik dan digital.",
    aboutP3: "",
  },
  zh: {
    aboutP1: "在过去几个月里，我一直非常兴奋地使用1960年代制作数字艺术的技术，结合CNC机器、重新编程的绘图仪，以及一台最初为运输箱标签设计的工业喷墨打印机。",
    aboutP2: "这件作品是尝试将模拟绘画和数字媒体过程融合的副产品，描绘了一种被困在物理现实和数字现实之间的阈限、困境般环境中的感觉。",
    aboutP3: "",
  },
  ja: {
    aboutP1: "ここ数ヶ月、1960年代にデジタルアートの制作に使われた技術を、CNCマシン、再プログラムされたプロッター、そして元々配送用木箱のラベリング用に設計された産業用インクジェットプリンターと組み合わせて使うことに大きな興奮を覚えています。",
    aboutP2: "この作品は、アナログの絵画とデジタルメディアのプロセスを融合しようとする試みの副産物であり、物理的現実とデジタル現実の間に位置するリミナルでアポリア的な環境に閉じ込められている感覚を描いています。",
    aboutP3: "",
  },
};

const galleryTranslations: Record<Lang, {
  works: string;
  about: string;
  press: string;
  shop: string;
  noPress: string;
  shopText: string;
  comingSoon: string;
  aboutP1: string;
  aboutP2: string;
  aboutP3: string;
}> = {
  en: {
    works: "Works",
    about: "About",
    press: "Press",
    shop: "Shop",
    noPress: "No press coverage yet.",
    shopText: "Prints available upon request. Contact for pricing and availability.",
    comingSoon: "Gallery content coming soon.",
    aboutP1: "During the fall of 2025, I started working with an AxiDraw pen plotter, trying to work around combining and integrate digital computational technologies into my more traditional drawing practice.",
    aboutP2: "The series of drawings here are a product of me testing and experimenting with varied methods and ways of mark-making and tooling, creating custom fountain pen attachments and reprogramming the plotter to access more variables of control.",
    aboutP3: "",
  },
  de: {
    works: "Werke",
    about: "Über",
    press: "Presse",
    shop: "Shop",
    noPress: "Noch keine Presseberichterstattung.",
    shopText: "Drucke auf Anfrage erhältlich. Kontaktieren Sie uns für Preise und Verfügbarkeit.",
    comingSoon: "Galerieinhalt kommt bald.",
    aboutP1: "Im Herbst 2025 begann ich mit einem AxiDraw-Stiftplotter zu arbeiten und versuchte, digitale Computertechnologien in meine eher traditionelle Zeichenpraxis zu integrieren.",
    aboutP2: "Die hier gezeigten Zeichnungen sind das Ergebnis meiner Experimente mit verschiedenen Methoden und Arten des Markierens und Werkzeugeinsatzes, der Herstellung individueller Füllfederhalter-Aufsätze und der Neuprogrammierung des Plotters, um mehr Kontrollvariablen nutzen zu können.",
    aboutP3: "",
  },
  fr: {
    works: "Œuvres",
    about: "À propos",
    press: "Presse",
    shop: "Boutique",
    noPress: "Pas encore de couverture presse.",
    shopText: "Tirages disponibles sur demande. Contactez-nous pour les prix et la disponibilité.",
    comingSoon: "Contenu de la galerie à venir.",
    aboutP1: "À l'automne 2025, j'ai commencé à travailler avec un traceur à plume AxiDraw, cherchant à combiner et intégrer les technologies numériques computationnelles dans ma pratique de dessin plus traditionnelle.",
    aboutP2: "La série de dessins présentée ici est le fruit de mes essais et expérimentations avec diverses méthodes et manières de faire des marques et d'outillage, créant des adaptateurs personnalisés pour stylos-plume et reprogrammant le traceur pour accéder à davantage de variables de contrôle.",
    aboutP3: "",
  },
  ko: {
    works: "작품",
    about: "소개",
    press: "언론",
    shop: "구매",
    noPress: "아직 언론 보도가 없습니다.",
    shopText: "요청 시 프린트 구매 가능합니다. 가격 및 재고 문의는 연락 바랍니다.",
    comingSoon: "갤러리 콘텐츠가 곧 공개됩니다.",
    aboutP1: "2025년 가을, 저는 AxiDraw 펜 플로터로 작업을 시작하며 디지털 컴퓨터 기술을 보다 전통적인 드로잉 실천에 결합하고 통합하려고 시도했습니다.",
    aboutP2: "여기 있는 드로잉 시리즈는 다양한 방법과 마크 메이킹 및 도구 사용 방식을 시험하고 실험한 결과물로, 맞춤형 만년필 어태치먼트를 제작하고 플로터를 재프로그래밍하여 더 많은 제어 변수에 접근한 것입니다.",
    aboutP3: "",
  },
  id: {
    works: "Karya",
    about: "Tentang",
    press: "Pers",
    shop: "Toko",
    noPress: "Belum ada liputan pers.",
    shopText: "Cetakan tersedia berdasarkan permintaan. Hubungi untuk harga dan ketersediaan.",
    comingSoon: "Konten galeri segera hadir.",
    aboutP1: "Pada musim gugur 2025, saya mulai bekerja dengan pen plotter AxiDraw, mencoba menggabungkan dan mengintegrasikan teknologi komputasi digital ke dalam praktik menggambar tradisional saya.",
    aboutP2: "Seri gambar di sini adalah hasil dari pengujian dan eksperimen saya dengan berbagai metode dan cara pembuatan tanda serta perkakas, membuat attachment pena fountain kustom dan memprogram ulang plotter untuk mengakses lebih banyak variabel kontrol.",
    aboutP3: "",
  },
  zh: {
    works: "作品",
    about: "关于",
    press: "媒体",
    shop: "商店",
    noPress: "暂无媒体报道。",
    shopText: "版画可按需购买。请联系了解价格和供应情况。",
    comingSoon: "画廊内容即将推出。",
    aboutP1: "2025年秋天，我开始使用AxiDraw笔式绘图仪进行创作，尝试将数字计算技术融合并整合到我较为传统的绘画实践中。",
    aboutP2: "这里展示的系列绘画是我测试和尝试各种标记制作方法与工具的成果，包括制作定制钢笔附件以及重新编程绘图仪以获取更多控制变量。",
    aboutP3: "",
  },
  ja: {
    works: "作品",
    about: "概要",
    press: "プレス",
    shop: "ショップ",
    noPress: "プレス報道はまだありません。",
    shopText: "プリントはリクエストに応じてご購入いただけます。価格と在庫についてはお問い合わせください。",
    comingSoon: "ギャラリーコンテンツは近日公開予定です。",
    aboutP1: "2025年の秋、私はAxiDrawペンプロッターでの制作を始め、デジタルコンピュテーション技術をより伝統的なドローイングの実践に組み合わせ、統合することを試みました。",
    aboutP2: "ここに展示されているドローイングシリーズは、さまざまなマークメイキングの方法やツールの使い方を試行錯誤した成果であり、カスタム万年筆アタッチメントの制作やプロッターの再プログラミングによって、より多くの制御変数にアクセスしたものです。",
    aboutP3: "",
  },
};

type Tab = "about" | "press" | "shop";
const tabKeys: Tab[] = ["about", "press", "shop"];

function ExhibitionPage({ lang, images, captions, aboutTexts, processImages, bounceImages, bounceImageSize, bounceContainerHeight, onContact }: {
  lang: Lang;
  images: string[];
  captions: Array<{ title: string; date: string; medium: string; dimensions: string }>;
  aboutTexts: { aboutP1: string; aboutP2: string; aboutP3: string };
  processImages?: string[];
  bounceImages?: string[];
  bounceImageSize?: number;
  bounceContainerHeight?: string;
  onContact?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("about");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [dynamicImgSize, setDynamicImgSize] = useState(bounceImageSize || 220);
  const gt = galleryTranslations[lang];

  // DVD bounce refs
  const printsBounceContainerRef = useRef<HTMLDivElement>(null);
  const printsSvgRef = useRef<SVGSVGElement>(null);

  // All images that go into the bounce box
  const allBounceImages = bounceImages || [
    ...(processImages || []),
    ...images,
  ];

  // DVD bounce effect for all images — proximity leader lines between nearby pairs
  useEffect(() => {
    if (activeTab !== "about" || allBounceImages.length === 0) return;

    const container = printsBounceContainerRef.current;
    const svg = printsSvgRef.current;
    if (!container || !svg) return;

    let cancelled = false;
    let rafId: number | null = null;
    let ro: ResizeObserver | null = null;

    const itemEls = Array.from(container.querySelectorAll<HTMLDivElement>("[data-bounce-item]"));
    if (itemEls.length === 0) return;
    const n = itemEls.length;

    // SVG group for dynamic proximity lines
    const connGroup = svg.querySelector("#prints-connections") as SVGGElement | null;

    // Pre-allocate a pool of line+dot SVG elements for connections
    const maxPairs = n * (n - 1) / 2;
    const NS = "http://www.w3.org/2000/svg";
    const pool: { path: SVGPathElement; dot1: SVGCircleElement; dot2: SVGCircleElement }[] = [];
    if (connGroup) {
      for (let p = 0; p < maxPairs; p++) {
        const path = document.createElementNS(NS, "path");
        path.setAttribute("stroke", "#e0e0e0");
        path.setAttribute("stroke-width", "1.5");
        path.setAttribute("fill", "none");
        path.style.display = "none";
        const d1 = document.createElementNS(NS, "circle");
        d1.setAttribute("r", "3.5");
        d1.setAttribute("fill", "#ddd");
        d1.style.display = "none";
        const d2 = document.createElementNS(NS, "circle");
        d2.setAttribute("r", "3.5");
        d2.setAttribute("fill", "#ddd");
        d2.style.display = "none";
        connGroup.appendChild(path);
        connGroup.appendChild(d1);
        connGroup.appendChild(d2);
        pool.push({ path, dot1: d1, dot2: d2 });
      }
    }

    // Compute responsive image size from container width
    const computeImgSize = (cw: number) => {
      if (bounceImageSize) {
        // Scale the provided size down on small screens
        if (cw < 500) return Math.max(60, Math.floor(cw * 0.2));
        if (cw < 700) return Math.max(80, Math.floor(cw * 0.22));
        return bounceImageSize;
      }
      // Default responsive: scale from 60px (tiny) to 220px (large)
      if (cw < 400) return Math.max(60, Math.floor(cw * 0.18));
      if (cw < 600) return Math.max(80, Math.floor(cw * 0.2));
      return 180;
    };

    const initTimer = window.setTimeout(() => {
      if (cancelled) return;

      let w = container.clientWidth;
      let h = container.clientHeight;
      const pad = 6;
      const imgSize = computeImgSize(w);
      setDynamicImgSize(imgSize);
      const connectDist = 120; // px — distance to form a new connection
      const disconnectDist = 180; // px — distance to break an existing connection (hysteresis)

      const sizes = itemEls.map((el) => ({
        w: el.offsetWidth || imgSize,
        h: el.offsetHeight || imgSize,
      }));

      const cols = Math.ceil(Math.sqrt(n));
      const rows = Math.ceil(n / cols);
      const state = itemEls.map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const iw = sizes[i].w, ih = sizes[i].h;
        const cellW = (w - pad * 2) / cols;
        const cellH = (h - pad * 2) / rows;
        const x = pad + cellW * col + cellW / 2;
        const y = pad + cellH * row + cellH / 2;
        const cx = Math.max(pad + iw / 2, Math.min(w - pad - iw / 2, x));
        const cy = Math.max(pad + ih / 2, Math.min(h - pad - ih / 2, y));
        const speed = 4 + (i % 5) * 2;
        const angle = (i * 2.39996) + 0.5;
        return { x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
      });

      itemEls.forEach((el) => { el.style.left = "0"; el.style.top = "0"; });

      const positionEl = (el: HTMLDivElement, x: number, y: number, iw: number, ih: number) => {
        el.style.transform = `translate3d(${x - iw / 2}px, ${y - ih / 2}px, 0)`;
      };

      // Find the closest edge center point between two rectangles
      const closestEdgeCenters = (
        ax: number, ay: number, aw: number, ah: number,
        bx: number, by: number, bw: number, bh: number,
      ) => {
        // 4 edge centers for each rect: top, bottom, left, right
        const edgesA = [
          { x: ax, y: ay - ah / 2 },  // top
          { x: ax, y: ay + ah / 2 },  // bottom
          { x: ax - aw / 2, y: ay },  // left
          { x: ax + aw / 2, y: ay },  // right
        ];
        const edgesB = [
          { x: bx, y: by - bh / 2 },
          { x: bx, y: by + bh / 2 },
          { x: bx - bw / 2, y: by },
          { x: bx + bw / 2, y: by },
        ];
        let bestDist = Infinity;
        let bestA = edgesA[0], bestB = edgesB[0];
        for (const ea of edgesA) {
          for (const eb of edgesB) {
            const dx = eb.x - ea.x, dy = eb.y - ea.y;
            const d = dx * dx + dy * dy;
            if (d < bestDist) { bestDist = d; bestA = ea; bestB = eb; }
          }
        }
        return { a: bestA, b: bestB, dist: Math.sqrt(bestDist) };
      };

      // Stable connections: each image can have at most one partner.
      // partner[i] = j means image i is connected to image j (-1 = none)
      const partner: number[] = new Array(n).fill(-1);

      const updateConnections = () => {
        // 1) Check existing connections — keep them if still within disconnectDist
        for (let i = 0; i < n; i++) {
          const j = partner[i];
          if (j < 0 || j <= i) continue; // only process each pair once (i < j)
          const a = state[i], b = state[j];
          const szA = sizes[i], szB = sizes[j];
          const { dist } = closestEdgeCenters(
            a.x, a.y, szA.w, szA.h,
            b.x, b.y, szB.w, szB.h,
          );
          if (dist >= disconnectDist) {
            partner[i] = -1;
            partner[j] = -1;
          }
        }

        // 2) For unconnected images, find nearest unconnected neighbor within connectDist
        for (let i = 0; i < n; i++) {
          if (partner[i] >= 0) continue;
          let bestJ = -1, bestDist = connectDist;
          for (let j = 0; j < n; j++) {
            if (j === i || partner[j] >= 0) continue;
            const a = state[i], b = state[j];
            const szA = sizes[i], szB = sizes[j];
            const { dist } = closestEdgeCenters(
              a.x, a.y, szA.w, szA.h,
              b.x, b.y, szB.w, szB.h,
            );
            if (dist < bestDist) { bestDist = dist; bestJ = j; }
          }
          if (bestJ >= 0) {
            partner[i] = bestJ;
            partner[bestJ] = i;
          }
        }

        // 3) Draw active connections
        let poolUsed = 0;
        for (let i = 0; i < n; i++) {
          const j = partner[i];
          if (j < 0 || j <= i) continue; // draw each pair once
          const a = state[i], b = state[j];
          const szA = sizes[i], szB = sizes[j];
          const { a: ptA, b: ptB, dist } = closestEdgeCenters(
            a.x, a.y, szA.w, szA.h,
            b.x, b.y, szB.w, szB.h,
          );
          if (poolUsed < pool.length) {
            const c = pool[poolUsed];
            const opacity = Math.max(0.15, 1 - dist / disconnectDist);
            // Quadratic Bezier: control point offset perpendicular to midpoint
            const mx = (ptA.x + ptB.x) / 2;
            const my = (ptA.y + ptB.y) / 2;
            const dx = ptB.x - ptA.x;
            const dy = ptB.y - ptA.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            // Perpendicular offset scaled by distance (bow outward ~30% of length)
            const bow = len * 0.3;
            const cx = mx + (-dy / len) * bow;
            const cy = my + (dx / len) * bow;
            c.path.setAttribute("d", `M${ptA.x},${ptA.y} Q${cx},${cy} ${ptB.x},${ptB.y}`);
            c.path.style.opacity = String(opacity);
            c.path.style.display = "";
            c.dot1.setAttribute("cx", String(ptA.x));
            c.dot1.setAttribute("cy", String(ptA.y));
            c.dot1.style.opacity = String(opacity);
            c.dot1.style.display = "";
            c.dot2.setAttribute("cx", String(ptB.x));
            c.dot2.setAttribute("cy", String(ptB.y));
            c.dot2.style.opacity = String(opacity);
            c.dot2.style.display = "";
            poolUsed++;
          }
        }
        // Hide unused
        for (let p = poolUsed; p < pool.length; p++) {
          pool[p].path.style.display = "none";
          pool[p].dot1.style.display = "none";
          pool[p].dot2.style.display = "none";
        }
      };

      // Initial render
      for (let i = 0; i < n; i++) {
        positionEl(itemEls[i], state[i].x, state[i].y, sizes[i].w, sizes[i].h);
      }
      updateConnections();

      let lastTime = performance.now();

      const step = (now: number) => {
        if (cancelled) return;
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        // Move each image, bounce off walls
        for (let i = 0; i < n; i++) {
          const s = state[i], sz = sizes[i];
          let nx = s.x + s.vx * dt, ny = s.y + s.vy * dt;
          if (ny - sz.h / 2 < pad) { s.vy = Math.abs(s.vy); ny = pad + sz.h / 2; }
          if (ny + sz.h / 2 > h - pad) { s.vy = -Math.abs(s.vy); ny = h - pad - sz.h / 2; }
          if (nx - sz.w / 2 < pad) { s.vx = Math.abs(s.vx); nx = pad + sz.w / 2; }
          if (nx + sz.w / 2 > w - pad) { s.vx = -Math.abs(s.vx); nx = w - pad - sz.w / 2; }
          s.x = nx; s.y = ny;
        }

        // AABB collision detection and separation
        const colGap = 4;
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            const a = state[i], b = state[j];
            const szA = sizes[i], szB = sizes[j];
            const hwA = szA.w / 2 + colGap, hhA = szA.h / 2 + colGap;
            const hwB = szB.w / 2 + colGap, hhB = szB.h / 2 + colGap;
            const overlapX = (hwA + hwB) - Math.abs(b.x - a.x);
            const overlapY = (hhA + hhB) - Math.abs(b.y - a.y);
            if (overlapX > 0 && overlapY > 0) {
              if (overlapX < overlapY) {
                const sign = b.x > a.x ? 1 : -1;
                const push = overlapX / 2 + 0.5;
                a.x -= sign * push; b.x += sign * push;
                if ((a.vx - b.vx) * sign > 0) { const t = a.vx; a.vx = b.vx; b.vx = t; }
              } else {
                const sign = b.y > a.y ? 1 : -1;
                const push = overlapY / 2 + 0.5;
                a.y -= sign * push; b.y += sign * push;
                if ((a.vy - b.vy) * sign > 0) { const t = a.vy; a.vy = b.vy; b.vy = t; }
              }
            }
          }
        }

        for (let i = 0; i < n; i++) {
          positionEl(itemEls[i], state[i].x, state[i].y, sizes[i].w, sizes[i].h);
        }
        updateConnections();
        rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);

      ro = new ResizeObserver(() => {
        if (cancelled) return;
        w = container.clientWidth;
        h = container.clientHeight;
        // Recalculate responsive image size
        const newImgSize = computeImgSize(w);
        setDynamicImgSize(newImgSize);
        for (let i = 0; i < n; i++) {
          // Update DOM element width — respect per-item scale
          const elSrc = itemEls[i].querySelector("img")?.getAttribute("src") || "";
          const elSize = elSrc.includes("iu%5Bp") ? newImgSize * 2 : elSrc.includes("6c20fd1a") ? newImgSize * 0.4 : newImgSize;
          itemEls[i].style.width = elSize + "px";
          sizes[i].w = itemEls[i].offsetWidth || elSize;
          sizes[i].h = itemEls[i].offsetHeight || elSize;
          const s = state[i], sz = sizes[i];
          s.x = Math.max(pad + sz.w / 2, Math.min(w - pad - sz.w / 2, s.x));
          s.y = Math.max(pad + sz.h / 2, Math.min(h - pad - sz.h / 2, s.y));
        }
      });
      ro.observe(container);
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(initTimer);
      if (rafId) cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      // Clean up pool elements
      if (connGroup) connGroup.innerHTML = "";
    };
  }, [activeTab, allBounceImages.length, bounceImageSize]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((c) => (c + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "Escape" && fullscreen) setFullscreen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextSlide, prevSlide, fullscreen]);

  const caption = captions[currentSlide];
  const tabLabels: Record<Tab, string> = { about: gt.about, press: gt.press, shop: gt.shop };

  return (
    <div>
      {/* Divider */}
      <div style={{ borderBottom: "1px solid #eee", marginBottom: 10, marginLeft: 15, marginRight: 15 }} />

      {/* Hero image with navigation arrows */}
      <div style={{ position: "relative", marginBottom: 10 }}>
        {/* Main image */}
        <div
          onClick={() => setFullscreen(true)}
          style={{
            width: "100%",
            maxHeight: "clamp(35vh, 50vw, 68vh)",
            overflow: "hidden",
            background: "#f8f8f8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

          }}
        >
          <img
            src={images[currentSlide]}
            alt={caption.title}
            style={{
              maxWidth: "100%",
              maxHeight: "clamp(35vh, 50vw, 68vh)",
              objectFit: "contain",
              display: "block",
              transition: "opacity 0.4s ease",
            }}
          />
        </div>

        {/* Previous arrow (hover) */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "15%",
            background: "transparent",
            border: "none",

            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingLeft: 16,
            opacity: 0,
            transition: "opacity 0.3s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0"; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Next arrow (hover) */}
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "15%",
            background: "transparent",
            border: "none",

            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: 16,
            opacity: 0,
            transition: "opacity 0.3s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0"; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 5l7 7-7 7" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Navigation arrows */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
        padding: "0 15px",
        fontFamily: "var(--site-font)",
        fontSize: 9,
        color: "#bbb",
      }}>
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          style={{
            background: "none",
            border: "none",

            padding: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span>{currentSlide + 1} / {images.length}</span>
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          style={{
            background: "none",
            border: "none",

            padding: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 5l7 7-7 7" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setFullscreen(true)}
          aria-label="Fullscreen"
          style={{
            background: "none",
            border: "none",

            padding: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Caption */}
      <div style={{ marginBottom: 8, padding: "0 15px", fontFamily: "var(--site-font)" }}>
        <div style={{ fontSize: 10, color: "#000" }}>
          <span style={{ fontStyle: "italic" }}>{caption.title}</span>, {caption.date}
        </div>
        <div style={{ fontSize: 9, color: "#999", marginTop: 1 }}>
          {caption.medium}
        </div>
        <div style={{ fontSize: 9, color: "#999" }}>
          {caption.dimensions}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div style={{
        display: "flex",
        gap: 4,
        marginBottom: 16,
        padding: "0 15px",
        overflowX: "auto",
      }}>
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setCurrentSlide(i)}
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              border: i === currentSlide ? "1px solid #bbb" : "1px solid #eee",
              padding: 0,
              background: "none",
  
              overflow: "hidden",
              opacity: i === currentSlide ? 1 : 0.5,
              transition: "opacity 0.2s ease, border-color 0.2s ease",
            }}
          >
            <img
              src={src}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </button>
        ))}
      </div>


      {/* Tab navigation */}
      <div style={{ borderTop: "1px solid #eee", marginBottom: 0, marginLeft: 15, marginRight: 15 }} />
      <div style={{
        display: "flex",
        gap: 18,
        borderBottom: "1px solid #eee",
        marginBottom: 14,
        padding: "0 15px",
        fontFamily: "var(--site-font)",
        fontSize: 10,
      }}>
        {tabKeys.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: "none",
              border: "none",
              padding: "6px 0",
  
              fontSize: 10,
              fontFamily: "var(--site-font)",
              color: activeTab === tab ? "#000" : "#bbb",
              borderBottom: activeTab === tab ? "1px solid #000" : "1px solid transparent",
              marginBottom: -1,
              transition: "color 0.2s ease",
            }}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ minHeight: 480, padding: "0 15px" }}>
        {activeTab === "about" && (
          <div style={{ paddingBottom: 20, fontFamily: "var(--site-font)" }}>
            <div style={{ maxWidth: 480, marginBottom: 100 }}>
              <p style={{ fontSize: 11, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>
                {aboutTexts.aboutP1}
              </p>
              <p style={{ fontSize: 11, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>
                {aboutTexts.aboutP2}
              </p>
              <p style={{ fontSize: 11, color: "#666", lineHeight: 1.6 }}>
                {aboutTexts.aboutP3}
              </p>
            </div>

            {allBounceImages.length > 0 && (
              <>
                <div style={{ borderBottom: "1px solid #eee", marginBottom: 20 }} />
                {/* DVD bounce all images */}
                <div
                  ref={printsBounceContainerRef}
                  style={{
                    position: "relative",
                    height: bounceContainerHeight || "clamp(500px, 80vh, 800px)",
                    overflow: "hidden",
                    borderBottom: "1px solid #ddd",
                    marginLeft: -15,
                    marginRight: -15,
                  }}
                >
                  <svg
                    ref={printsSvgRef}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                      overflow: "visible",
                    }}
                  >
                    {/* Pool of proximity connection lines — max possible pairs */}
                    <g id="prints-connections" />
                  </svg>

                  {allBounceImages.map((src, i) => (
                    <div
                      key={src + i}
                      data-bounce-item
                      style={{
                        position: "absolute",
                        width: src.includes("iu%5Bp") ? dynamicImgSize * 2 : src.includes("6c20fd1a") ? dynamicImgSize * 0.4 : dynamicImgSize,
                        userSelect: "none",
                        pointerEvents: "none",
                        willChange: "transform",
                        opacity: src.endsWith(".gif") ? 0.35 : 1,
                      }}
                    >
                      <img
                        src={src}
                        alt={`Bounce ${i + 1}`}
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                          border: "1px solid #eee",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "press" && (
          <div style={{ paddingBottom: 20, fontFamily: "var(--site-font)" }} />
        )}

        {activeTab === "shop" && (
          <div style={{ paddingBottom: 20, fontFamily: "var(--site-font)" }} />
        )}
      </div>

      {/* Fullscreen overlay — portalled to body */}
      {fullscreen && createPortal(
        <div
          className="fullscreen-viewer"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <style>{`
            .fullscreen-viewer, .fullscreen-viewer * { cursor: none !important; }
          `}</style>
          {/* Top bar: close button */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "16px 20px",
            flexShrink: 0,
          }}>
            <button
              onClick={() => setFullscreen(false)}
              aria-label="Close fullscreen"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Image area with side arrows */}
          <div style={{
            flex: 1,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            padding: "0 60px",
            minHeight: 0,
          }}>
            {/* Previous arrow — left side */}
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 60,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.4,
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.4"; }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <img
              src={images[currentSlide]}
              alt={captions[currentSlide].title}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />

            {/* Next arrow — right side */}
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: 60,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.4,
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.4"; }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Bottom navigation row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: "16px 20px",
            flexShrink: 0,
            fontFamily: "var(--site-font)",
            fontSize: 10,
            color: "#bbb",
          }}>
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span>{currentSlide + 1} / {images.length}</span>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

/* ── Writing / Library page ────────────────────────────────────────── */

/* ── Lectures / Teaching data ─────────────────────────────────────── */

interface LectureEntry {
  title: string;
  institution: string;
  year: string;
  category: string;
  cover: string;
  pdf?: string;
  description?: string;
}

const lectureEntries: LectureEntry[] = [
  { title: "Placeholder", institution: "", year: "", category: "Keynote", cover: "/Plotter_1.png" },
  { title: "Placeholder", institution: "", year: "", category: "Keynote", cover: "/plotter_2.png" },
  { title: "Placeholder", institution: "", year: "", category: "Workshop", cover: "/plotter_4.jpg" },
  { title: "Placeholder", institution: "", year: "", category: "Workshop", cover: "/plotter_5.jpg" },
  { title: "Placeholder", institution: "", year: "", category: "Workshop", cover: "/plotter_6.jpg" },
];

const lectureCategories = ["Keynote", "Workshop"] as const;

// All images for writing circular chain: 6 TXT (essays) + 8 IMG (press) thumbnails
const writingAllImages = [
  ...txtTiles.map((tile) => ({ src: tile.thumbnail, type: "essay" as const })),
  ...imgTiles.map((tile) => ({ src: tile.thumbnail, type: "press" as const })),
];

type WritingFilter = "all" | "essay" | "press";

function WritingLibrary({ lang }: { lang: Lang }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dynamicImgSize, setDynamicImgSize] = useState(120);
  const [writingFilter, setWritingFilter] = useState<WritingFilter>("all");
  const filteredImages = writingFilter === "all"
    ? writingAllImages
    : writingAllImages.filter((img) => img.type === writingFilter);

  // Circular orbit with AABB collision + organic drift + chain leader lines
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    let cancelled = false;
    let rafId: number | null = null;
    let ro: ResizeObserver | null = null;

    const itemEls = Array.from(container.querySelectorAll<HTMLDivElement>("[data-bounce-item]"));
    if (itemEls.length === 0) return;
    const n = itemEls.length;

    const connGroup = svg.querySelector("#writing-connections") as SVGGElement | null;

    const NS = "http://www.w3.org/2000/svg";
    const chainLines: { path: SVGPathElement; dot1: SVGCircleElement; dot2: SVGCircleElement }[] = [];
    if (connGroup) {
      for (let p = 0; p < n; p++) {
        const path = document.createElementNS(NS, "path");
        path.setAttribute("stroke", "#e0e0e0");
        path.setAttribute("stroke-width", "1.5");
        path.setAttribute("fill", "none");
        const d1 = document.createElementNS(NS, "circle");
        d1.setAttribute("r", "3");
        d1.setAttribute("fill", "#ddd");
        const d2 = document.createElementNS(NS, "circle");
        d2.setAttribute("r", "3");
        d2.setAttribute("fill", "#ddd");
        connGroup.appendChild(path);
        connGroup.appendChild(d1);
        connGroup.appendChild(d2);
        chainLines.push({ path, dot1: d1, dot2: d2 });
      }
    }

    const computeImgSize = (cw: number) => {
      if (cw < 400) return Math.max(60, Math.floor(cw * 0.2));
      if (cw < 600) return Math.max(80, Math.floor(cw * 0.18));
      return 120;
    };

    // Per-image drift: oscillating radial offset
    const driftParams = Array.from({ length: n }, (_, i) => ({
      freq: 0.12 + (i * 0.031) % 0.1,
      phase: (i * 2.39996) % (Math.PI * 2),
      amplitude: 18 + (i * 9) % 30,
    }));

    const initTimer = window.setTimeout(() => {
      if (cancelled) return;

      let w = container.clientWidth;
      let h = container.clientHeight;
      const imgSize = computeImgSize(w);
      setDynamicImgSize(imgSize);

      const sizes = itemEls.map((el) => ({
        w: el.offsetWidth || imgSize,
        h: el.offsetHeight || imgSize,
      }));

      const centerX = w / 2;
      const centerY = h / 2;

      const maxDiag = Math.max(...sizes.map(s => Math.sqrt(s.w * s.w + s.h * s.h)));
      const minSpacing = maxDiag + 16;
      const minRadiusFromSpacing = (minSpacing * n) / (2 * Math.PI);
      const maxRadiusFromContainer = Math.min(centerX, centerY) - maxDiag / 2 - 10;
      const baseRadius = Math.min(maxRadiusFromContainer, Math.max(minRadiusFromSpacing, 100));

      let orbitAngle = 0;
      const orbitSpeed = 0.1;
      let totalTime = 0;

      // Each image has actual position (x,y) that starts on the orbit
      // and gets nudged by collision resolution
      const state = itemEls.map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        return {
          x: centerX + Math.cos(a) * baseRadius,
          y: centerY + Math.sin(a) * baseRadius,
        };
      });

      itemEls.forEach((el) => { el.style.left = "0"; el.style.top = "0"; });

      const positionEl = (el: HTMLDivElement, x: number, y: number, iw: number, ih: number) => {
        el.style.transform = `translate3d(${x - iw / 2}px, ${y - ih / 2}px, 0)`;
      };

      // Target position on the orbit ring (with drift)
      const getTargetPos = (i: number) => {
        const a = orbitAngle + (i / n) * Math.PI * 2;
        const dp = driftParams[i];
        const drift = dp.amplitude * Math.sin(dp.freq * totalTime + dp.phase);
        const r = baseRadius + drift;
        return { x: centerX + Math.cos(a) * r, y: centerY + Math.sin(a) * r };
      };

      // Stable line endpoint: ray from center toward target, clipped at rect edge
      const rectEdgePoint = (
        cx: number, cy: number, hw: number, hh: number,
        targetX: number, targetY: number,
      ) => {
        const dx = targetX - cx;
        const dy = targetY - cy;
        if (dx === 0 && dy === 0) return { x: cx, y: cy };
        const sx = hw / Math.abs(dx || 0.001);
        const sy = hh / Math.abs(dy || 0.001);
        const s = Math.min(sx, sy);
        return { x: cx + dx * s, y: cy + dy * s };
      };

      const updateChain = () => {
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          const a = state[i], b = state[j];
          const szA = sizes[i], szB = sizes[j];
          const ptA = rectEdgePoint(a.x, a.y, szA.w / 2, szA.h / 2, b.x, b.y);
          const ptB = rectEdgePoint(b.x, b.y, szB.w / 2, szB.h / 2, a.x, a.y);
          const c = chainLines[i];
          // Quadratic Bezier: control point offset perpendicular to midpoint
          const mx = (ptA.x + ptB.x) / 2;
          const my = (ptA.y + ptB.y) / 2;
          const dx = ptB.x - ptA.x;
          const dy = ptB.y - ptA.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const bow = len * 0.3;
          const cx = mx + (-dy / len) * bow;
          const cy = my + (dx / len) * bow;
          c.path.setAttribute("d", `M${ptA.x},${ptA.y} Q${cx},${cy} ${ptB.x},${ptB.y}`);
          c.dot1.setAttribute("cx", String(ptA.x));
          c.dot1.setAttribute("cy", String(ptA.y));
          c.dot2.setAttribute("cx", String(ptB.x));
          c.dot2.setAttribute("cy", String(ptB.y));
        }
      };

      // Initial render
      for (let i = 0; i < n; i++) {
        positionEl(itemEls[i], state[i].x, state[i].y, sizes[i].w, sizes[i].h);
      }
      updateChain();

      let lastTime = performance.now();

      const step = (now: number) => {
        if (cancelled) return;
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        totalTime += dt;
        orbitAngle += orbitSpeed * dt;

        // 1) Pull each image toward its orbit target position (spring force)
        const pullStrength = 3.0; // how fast images return to orbit
        for (let i = 0; i < n; i++) {
          const target = getTargetPos(i);
          state[i].x += (target.x - state[i].x) * pullStrength * dt;
          state[i].y += (target.y - state[i].y) * pullStrength * dt;
        }

        // 2) AABB collision: push overlapping images apart
        const colGap = 6;
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            const a = state[i], b = state[j];
            const szA = sizes[i], szB = sizes[j];
            const hwA = szA.w / 2 + colGap, hhA = szA.h / 2 + colGap;
            const hwB = szB.w / 2 + colGap, hhB = szB.h / 2 + colGap;
            const overlapX = (hwA + hwB) - Math.abs(b.x - a.x);
            const overlapY = (hhA + hhB) - Math.abs(b.y - a.y);
            if (overlapX > 0 && overlapY > 0) {
              if (overlapX < overlapY) {
                const sign = b.x > a.x ? 1 : -1;
                const push = overlapX / 2 + 1;
                a.x -= sign * push;
                b.x += sign * push;
              } else {
                const sign = b.y > a.y ? 1 : -1;
                const push = overlapY / 2 + 1;
                a.y -= sign * push;
                b.y += sign * push;
              }
            }
          }
        }

        // 3) Clamp to container bounds
        const pad = 4;
        for (let i = 0; i < n; i++) {
          const sz = sizes[i];
          state[i].x = Math.max(pad + sz.w / 2, Math.min(w - pad - sz.w / 2, state[i].x));
          state[i].y = Math.max(pad + sz.h / 2, Math.min(h - pad - sz.h / 2, state[i].y));
        }

        for (let i = 0; i < n; i++) {
          positionEl(itemEls[i], state[i].x, state[i].y, sizes[i].w, sizes[i].h);
        }
        updateChain();
        rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);

      ro = new ResizeObserver(() => {
        if (cancelled) return;
        w = container.clientWidth;
        h = container.clientHeight;
        const newImgSize = computeImgSize(w);
        setDynamicImgSize(newImgSize);
        for (let i = 0; i < n; i++) {
          itemEls[i].style.width = newImgSize + "px";
          sizes[i].w = itemEls[i].offsetWidth || newImgSize;
          sizes[i].h = itemEls[i].offsetHeight || newImgSize;
        }
      });
      ro.observe(container);
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(initTimer);
      if (rafId) cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      if (connGroup) connGroup.innerHTML = "";
    };
  }, [writingFilter]);

  return (
    <div style={{ fontFamily: "var(--site-font)", display: "flex", gap: 24 }}>
      {/* Left side — circular chain animation */}
      <div style={{ flex: 1, position: "relative" }}>
        <div
          ref={containerRef}
          style={{
            position: "relative",
            height: "clamp(400px, 60vw, 800px)",
            overflow: "hidden",
          }}
        >
          <svg
            ref={svgRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              overflow: "visible",
            }}
          >
            <g id="writing-connections" />
          </svg>

          {filteredImages.map((img, i) => (
            <div
              key={img.src + i}
              data-bounce-item
              style={{
                position: "absolute",
                width: dynamicImgSize,
                userSelect: "none",
                willChange: "transform",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget.querySelector("img") as HTMLImageElement;
                if (el) { el.style.opacity = "1"; el.style.transform = "scale(1.05)"; }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget.querySelector("img") as HTMLImageElement;
                if (el) { el.style.opacity = "0.45"; el.style.transform = "scale(1)"; }
              }}
            >
              <img
                src={img.src}
                alt={`Writing ${i + 1}`}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  border: "1px solid #eee",
                  opacity: 0.45,
                  transition: "opacity 0.25s, transform 0.25s",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right side — phone SVG + filter boxes */}
      <div style={{
        width: 280,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}>
        <img
          src="/writing-phone.svg"
          alt="Writing Collection / Press — Reid Surmeier"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            opacity: 0.45,
          }}
        />

        {/* Filter boxes */}
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          {(["all", "essay", "press"] as const).map((f) => {
            const label = f === "all" ? "All" : f === "essay" ? "Essays" : "Press";
            const active = writingFilter === f;
            return (
              <button
                key={f}
                onClick={() => setWritingFilter(f)}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  fontSize: 12,
                  fontFamily: "var(--site-font)",
                  fontWeight: active ? 600 : 400,
                  color: active ? "#222" : "#aaa",
                  background: "none",
                  border: `1px solid ${active ? "#222" : "#ddd"}`,
                  borderRadius: 3,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}





const lectureCategoryTranslations: Record<Lang, Record<string, string>> = {
  en: { All: "All", Keynote: "Keynote", Workshop: "Workshop" },
  de: { All: "Alle", Keynote: "Keynote", Workshop: "Workshop" },
  fr: { All: "Tout", Keynote: "Conf\u00E9rence", Workshop: "Atelier" },
  ko: { All: "\uBAA8\uB450", Keynote: "\uAE30\uC870\uC5F0\uC124", Workshop: "\uC6CC\uD06C\uC20D" },
  id: { All: "Semua", Keynote: "Keynote", Workshop: "Lokakarya" },
  zh: { All: "\u5168\u90E8", Keynote: "\u4E3B\u9898\u6F14\u8BB2", Workshop: "\u5DE5\u4F5C\u574A" },
  ja: { All: "\u3059\u3079\u3066", Keynote: "\u57FA\u8ABF\u8B1B\u6F14", Workshop: "\u30EF\u30FC\u30AF\u30B7\u30E7\u30C3\u30D7" },
};

function LecturesLibrary({ lang }: { lang: Lang }) {
  const lecCatT = lectureCategoryTranslations[lang];
  const [filter, setFilter] = useState<string | null>(null);
  const [openEntry, setOpenEntry] = useState<LectureEntry | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const filtered = filter ? lectureEntries.filter((e) => e.category === filter) : lectureEntries;

  const spineColors = [
    "linear-gradient(to right, #EFEF3B 33%, #F5F58A 66%, #eee 99%)",
    "linear-gradient(to right, #C5D5F0 33%, #D8E4F5 66%, #eee 99%)",
    "linear-gradient(to right, #C5A0D0 33%, #D8C0E0 66%, #eee 99%)",
    "linear-gradient(to right, #F0C5D5 33%, #F5D8E4 66%, #eee 99%)",
    "linear-gradient(to right, #D5F0C5 33%, #E4F5D8 66%, #eee 99%)",
  ];

  const handleOpen = (entry: LectureEntry) => {
    setOpenEntry(entry);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setDetailVisible(true));
    });
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setTimeout(() => setOpenEntry(null), 400);
  };

  useEffect(() => {
    if (!openEntry) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseDetail();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <div className="lectures-library" style={{ fontFamily: "var(--site-font)" }}>
      <style>{`
        .lectures-library, .lectures-library * {
          font-family: var(--site-font) !important;
        }
        .lecture-card {
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
          transform: skewX(-2deg);
          opacity: 0.7;
        }
        .lecture-card:hover {
          transform: skewX(0deg) scale(1.06);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          opacity: 1;
          z-index: 2;
        }
        .lecture-spine {
          position: absolute;
          top: -6px;
          left: 0;
          height: 6px;
          width: 100%;
          transform-origin: bottom;
          border-radius: 2px 2px 0 0;
          opacity: 0.6;
        }
        .lecture-edge {
          position: absolute;
          right: -6px;
          top: -6px;
          width: 6px;
          height: calc(100% + 6px);
          background: linear-gradient(to bottom, #ddd, #eee);
          transform-origin: left;
          border-radius: 0 2px 2px 0;
          opacity: 0.6;
        }
      `}</style>

      {/* Filter row */}
      <div style={{
        display: "flex",
        gap: 18,
        marginBottom: 24,
      }}>
        <button
          onClick={() => setFilter(null)}
          style={{
            background: "none",
            border: "none",

            padding: 0,
            fontFamily: "var(--site-font)",
            fontSize: 11,
            color: filter === null ? "#000" : "#bbb",
            borderBottom: filter === null ? "1px solid #000" : "1px solid transparent",
            paddingBottom: 3,
          }}
        >
          {lecCatT.All} ({lectureEntries.length})
        </button>
        {lectureCategories.map((cat) => {
          const count = lectureEntries.filter((e) => e.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                background: "none",
                border: "none",
    
                padding: 0,
                fontFamily: "var(--site-font)",
                fontSize: 11,
                color: filter === cat ? "#000" : "#bbb",
                borderBottom: filter === cat ? "1px solid #000" : "1px solid transparent",
                paddingBottom: 3,
              }}
            >
              {lecCatT[cat] || cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid — landscape cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 28,
        paddingBottom: 60,
        paddingTop: 10,
        paddingRight: 8,
      }}>
        {filtered.map((entry, i) => {
          const spineGradient = spineColors[i % spineColors.length];
          return (
            <div
              key={i}
              onClick={() => handleOpen(entry)}
            >
              <div className="lecture-card">
                {/* 3D Top spine */}
                <div className="lecture-spine" style={{ background: spineGradient }} />
                {/* 3D Right edge */}
                <div className="lecture-edge" />

                {/* Cover — landscape */}
                <div style={{
                  aspectRatio: "4/3",
                  overflow: "hidden",
                  background: "#f5f5f5",
                  marginBottom: 8,
                  position: "relative",
                  boxShadow: "1px 1px 3px rgba(0,0,0,0.1)",
                }}>
                  <img
                    src={entry.cover}
                    alt={entry.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Detail overlay — slides up */}
      {openEntry && createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            transform: detailVisible ? "translateY(0)" : "translateY(100%)",
            transition: "transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 20px",
            flexShrink: 0,
          }}>
            <div style={{ fontFamily: "var(--site-font)", fontSize: 11, color: "#bbb", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              <span style={{ fontStyle: "italic" }}>{openEntry.title}</span>
              <span style={{ color: "#ccc" }}> — {openEntry.institution}</span>
            </div>
            <button
              onClick={handleCloseDetail}
              style={{
                background: "transparent",
                border: "none",
    
                fontSize: 13,
                fontFamily: "var(--site-font)",
                color: "#000",
                padding: 0,
                flexShrink: 0,
                marginLeft: 16,
              }}
            >
              &uarr; Back
            </button>
          </div>

          {/* Cover + info */}
          <div style={{
            padding: "0 20px 20px 20px",
            flexShrink: 0,
            borderBottom: "1px solid #eee",
          }}>
            <div style={{
              maxWidth: 400,
              aspectRatio: "4/3",
              overflow: "hidden",
              background: "#f5f5f5",
              boxShadow: "1px 1px 4px rgba(0,0,0,0.1)",
              marginBottom: 12,
            }}>
              <img
                src={openEntry.cover}
                alt={openEntry.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <div style={{ fontFamily: "var(--site-font)" }}>
              <div style={{ fontSize: 13, color: "#000", fontStyle: "italic" }}>{openEntry.title}</div>
              <div style={{ fontSize: 11, color: "#999", marginTop: 3 }}>{openEntry.institution}</div>
              <div style={{ fontSize: 10, color: "#bbb", marginTop: 3 }}>{openEntry.year} · {openEntry.category}</div>
              {openEntry.description && (
                <p style={{ fontSize: 11, color: "#666", lineHeight: 1.6, marginTop: 12, maxWidth: 480 }}>
                  {openEntry.description}
                </p>
              )}
            </div>
          </div>

          {/* PDF or empty area */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            {openEntry.pdf ? (
              <iframe
                src={openEntry.pdf}
                title={openEntry.title}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            ) : (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                fontFamily: "var(--site-font)",
                fontSize: 11,
                color: "#bbb",
              }}>
                Materials coming soon.
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── Web + UI/UX Case Study page ────────────────────────────────── */

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div style={{ marginBottom: 40 }}>
      {label && (
        <div style={{ fontFamily: "var(--site-font)", fontSize: 9, color: "#bbb", marginBottom: 6 }}>{label}</div>
      )}
      <pre style={{
        fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
        fontSize: 10,
        lineHeight: 1.6,
        color: "#444",
        background: "#f8f8f8",
        border: "1px solid #eee",
        padding: "16px 20px",
        overflow: "auto",
        whiteSpace: "pre",
        margin: 0,
      }}>
        {code}
      </pre>
    </div>
  );
}

function PhoneFrame({ video, caption, loop: shouldLoop = true }: { video: string; caption?: string; loop?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldLoop || !containerRef.current || !videoRef.current) return;
    const vid = videoRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          vid.currentTime = 0;
          vid.play();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [shouldLoop]);

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        position: "relative",
        width: 240,
        aspectRatio: "608 / 1236",
      }}>
        {/* Screen area — matches frame's transparent cutout exactly */}
        {/* Frame: 608×1236, screen: x=39..568, y=40..1196 */}
        <div style={{
          position: "absolute",
          left: "6.4%",
          top: "3.2%",
          width: "87%",
          height: "93.5%",
          overflow: "hidden",
          background: "#fff",
          zIndex: 1,
        }}>
          <video
            ref={videoRef}
            src={video}
            autoPlay
            loop={shouldLoop}
            muted
            playsInline
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        {/* Phone frame overlay */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/phone-frame.png"
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
      </div>
      {caption && (
        <div style={{ fontFamily: "var(--site-font)", fontSize: 9, color: "#bbb", marginTop: 14, textAlign: "center", maxWidth: 200 }}>{caption}</div>
      )}
    </div>
  );
}

function CaseStudyImage({ src, caption }: { src: string; caption?: string }) {
  return (
    <div style={{ marginBottom: caption ? 8 : 40 }}>
      <div style={{
        overflow: "hidden",
        border: "1px solid #eee",
        background: "#f8f8f8",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={caption || ""}
          style={{ width: "100%", display: "block" }}
        />
      </div>
      {caption && (
        <div style={{ fontFamily: "var(--site-font)", fontSize: 9, color: "#bbb", marginTop: 6, marginBottom: 32 }}>{caption}</div>
      )}
    </div>
  );
}

const caseStudySlides = [
  { src: "/Screenshot%202026-02-15%20at%2012.25.50%E2%80%AFPM.png", caption: "Homepage — bio text with highlighted disciplines, staggered book cover grid, sidebar navigation" },
  { src: "/Screenshot%202026-02-15%20at%202.54.34%E2%80%AFPM.png", caption: "Curriculum Vitae — interactive timeline with education, exhibitions, awards, and experience" },
  { src: "/Screenshot%202026-02-15%20at%208.31.11%E2%80%AFPM.png", caption: "Writing — library grid with 3D book spine effect and category filters" },
  { src: "/Screenshot%202026-02-14%20at%209.26.45%E2%80%AFPM.png", caption: "Bio text — highlighted discipline keywords with colored backgrounds" },
];

function CaseStudySlideshow() {
  const [current, setCurrent] = useState(0);
  const prev = useCallback(() => setCurrent(i => (i - 1 + caseStudySlides.length) % caseStudySlides.length), []);
  const next = useCallback(() => setCurrent(i => (i + 1) % caseStudySlides.length), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  const slide = caseStudySlides[current];

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Main image */}
      <div style={{ position: "relative", marginBottom: 10 }}>
        <div style={{
          width: "100%",
          maxHeight: "68vh",
          overflow: "hidden",
          background: "#f8f8f8",
          border: "1px solid #eee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.src}
            alt={slide.caption}
            style={{
              maxWidth: "100%",
              maxHeight: "68vh",
              objectFit: "contain",
              display: "block",
              transition: "opacity 0.4s ease",
            }}
          />
        </div>

        {/* Prev arrow (hover) */}
        <button
          onClick={prev}
          aria-label="Previous"
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: "15%",
            background: "transparent", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "flex-start",
            paddingLeft: 16, opacity: 0, transition: "opacity 0.3s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0"; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Next arrow (hover) */}
        <button
          onClick={next}
          aria-label="Next"
          style={{
            position: "absolute", right: 0, top: 0, bottom: 0, width: "15%",
            background: "transparent", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "flex-end",
            paddingRight: 16, opacity: 0, transition: "opacity 0.3s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0"; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 5l7 7-7 7" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Nav + counter */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 8,
        fontFamily: "var(--site-font)", fontSize: 9, color: "#bbb",
      }}>
        <button onClick={prev} aria-label="Previous" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span>{current + 1} / {caseStudySlides.length}</span>
        <button onClick={next} aria-label="Next" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 5l7 7-7 7" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Caption */}
      <div style={{ fontFamily: "var(--site-font)", fontSize: 9, color: "#bbb", marginBottom: 10 }}>
        {slide.caption}
      </div>

      {/* Thumbnail strip */}
      <div style={{ display: "flex", gap: 4 }}>
        {caseStudySlides.map((s, i) => (
          <button
            key={s.src}
            onClick={() => setCurrent(i)}
            style={{
              width: 48, height: 36, flexShrink: 0,
              border: i === current ? "1px solid #bbb" : "1px solid #eee",
              padding: 0, background: "none", cursor: "pointer", overflow: "hidden",
              opacity: i === current ? 1 : 0.5,
              transition: "opacity 0.2s ease, border-color 0.2s ease",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </button>
        ))}
      </div>
    </div>
  );
}

function CaseStudyPage() {
  const codeLeaderLine = `const drawLines = useCallback(
  (sourceRef, targets) => {
    const LL = window.LeaderLine;
    const container = cover2Ref.current.parentElement;
    const coverEls = Array.from(container.children);
    const rects = coverEls.map(el => el.getBoundingClientRect());

    // Group covers into rows by bottom-Y (flex-end aligned)
    const rowBuckets = new Map();
    for (const r of rects) {
      const key = Math.round(r.bottom / 20) * 20;
      const row = rowBuckets.get(key);
      if (row) {
        row.top = Math.min(row.top, r.top);
        row.bottom = Math.max(row.bottom, r.bottom);
      } else {
        rowBuckets.set(key, { top: r.top, bottom: r.bottom });
      }
    }

    // Route lines through gap corridors between rows
    const rows = Array.from(rowBuckets.values())
      .sort((a, b) => a.top - b.top);
    const gaps = [rows[0].top - 10];
    for (let i = 0; i < rows.length - 1; i++) {
      gaps.push((rows[i].bottom + rows[i + 1].top) / 2);
    }

    for (const { ref, color } of targets) {
      // Create waypoints and draw segmented leader lines
      new LL(startWp, corridorWp, { path: "straight", color, size: 2 });
      new LL(corridorWp, gapWp, { path: "straight", color, size: 2 });
      new LL(gapWp, targetWp, { path: "straight", color, size: 2 });
    }
  }, [createWaypoint, typingDone, isHomePage]
);`;

  const codeBookCard = `.book-card {
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
  transform: skewY(-2deg);
  opacity: 0.7;
}
.book-card:hover {
  transform: skewY(0deg) scale(1.08);
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  opacity: 1;
  z-index: 2;
}
.book-spine {
  position: absolute;
  left: -8px;
  top: 0;
  width: 8px;
  height: 100%;
  transform-origin: right;
  border-radius: 2px 0 0 2px;
  opacity: 0.6;
}`;

  const codeTypewriter = `function TypewriterText({ children, delay = 0, speed = 40 }) {
  const [charCount, setCharCount] = useState(0);
  const [started, setStarted] = useState(false);
  const FADE_WINDOW = 4;
  const totalSteps = Array.from(children).length + FADE_WINDOW;

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started || charCount >= totalSteps) return;
    const timer = setTimeout(() => setCharCount(c => c + 1), speed);
    return () => clearTimeout(timer);
  }, [started, charCount, totalSteps, speed]);

  return (
    <span>
      {Array.from(children).map((char, i) => {
        let opacity = 0;
        if (i < charCount - FADE_WINDOW) opacity = 1;
        else if (i < charCount) opacity = (charCount - i) / FADE_WINDOW;
        return <span style={{ opacity, transition: "opacity 0.2s ease" }}>{char}</span>;
      })}
    </span>
  );
}`;

  const codeCVAnimation = `// Nodes positioned by percentage coordinates on a responsive canvas
const nodes: CVNode[] = [
  { id: "risd", section: "education", x: 68, y: 6, label: "RISD",
    sublabel: "B.F.A., Art & Computation + PT" },
  { id: "unthought", section: "exhibition", tag: "S", x: 78, y: 36,
    label: "Unthought: Somewhere and Elsewhere" },
  // ...20+ nodes across education, exhibition, award, experience
];

// Staggered reveal: nodes appear left-to-right, edges draw after both endpoints visible
useEffect(() => {
  sortedNodes.forEach((node, i) => {
    setTimeout(() => {
      setVisibleNodes(prev => new Set(prev).add(node.id));
    }, 400 + i * 120);
  });

  edges.forEach((edge) => {
    const laterIdx = Math.max(
      sortedNodes.findIndex(n => n.id === edge.from),
      sortedNodes.findIndex(n => n.id === edge.to)
    );
    setTimeout(() => {
      setAnimatedEdges(prev => new Set(prev).add(edge.id));
    }, 400 + laterIdx * 120 + 200);
  });
}, [sortedNodes]);

// Edge SVG: stroke-dashoffset animates from line length to 0
<line
  strokeDasharray={lineLength}
  strokeDashoffset={isAnimated ? 0 : lineLength}
  style={{
    transition: isAnimated
      ? "stroke-dashoffset 600ms ease-out"
      : "none",
  }}
/>`;

  const codeCursor = `export default function CustomCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const onMove = (e) => {
      cursor.style.left = \`\${e.clientX}px\`;
      cursor.style.top = \`\${e.clientY}px\`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={cursorRef} style={{
      position: "fixed",
      width: 8, height: 8,
      background: "transparent",
      border: "1px solid #ccc",
      pointerEvents: "none",
      zIndex: 999999,
      transform: "translate(-50%, -50%)",
      mixBlendMode: "difference",
    }} />
  );
}`;

  return (
    <div className="case-study-page" style={{ fontFamily: "var(--site-font)" }}>
      <style>{`
        .case-study-page, .case-study-page * {
          font-family: var(--site-font) !important;
        }
        .case-study-page pre, .case-study-page pre * {
          font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace !important;
        }
      `}</style>

      {/* Divider */}
      <div style={{ borderBottom: "1px solid #eee", marginBottom: 30 }} />

      {/* Project Title */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 16, color: "#000", fontWeight: 600 }}>reidsurmeier.com</div>
      </div>

      {/* Meta row */}
      <div style={{ fontSize: 10, color: "#999", lineHeight: 1.8, marginBottom: 30 }}>
        <span>Design & Development</span>
        <span style={{ color: "#ddd" }}> / </span>
        <span>2025–2026</span>
        <span style={{ color: "#ddd" }}> / </span>
        <span>Next.js, React, TypeScript, leader-line.js</span>
      </div>

      {/* Phone Mockups — side by side, right below title */}
      <div style={{ display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap", marginBottom: 50, padding: "20px 0" }}>
        <PhoneFrame
          video="/mobile-home.mp4"
          caption="Homepage — bio, book covers, typewriter animation"
          loop={false}
        />
        <PhoneFrame
          video="/mobile-cv.mp4"
          caption="CV — timeline nodes, staggered reveal"
        />
      </div>

      <div style={{ borderBottom: "1px solid #eee", marginBottom: 40 }} />

      {/* Image slideshow */}
      <CaseStudySlideshow />

      {/* Overview */}
      <div style={{ marginBottom: 50 }}>
        <div style={{ fontSize: 13, color: "#000", fontWeight: 600, marginBottom: 12 }}>Overview</div>
        <div style={{ maxWidth: 520 }}>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>
            A personal portfolio and studio website built as a single-page application with persistent sidebar navigation, multilingual support across seven languages, and interactive data visualization connecting sidebar categories to featured works through animated leader lines.
          </p>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>
            The site functions as both a portfolio and an exhibition platform — each discipline (prints, painting, writing, lectures) opens a dedicated sub-page with its own interaction model: Gagosian-style image exhibitions with fullscreen viewers, 3D book grids with inline PDF readers, and long-scroll case studies.
          </p>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7 }}>
            Every interface element is custom: the cursor, the typewriter text animations, the staggered reveal of book covers, the leader line routing algorithm that paths connections through gaps between flex-wrapped rows.
          </p>
        </div>
      </div>


      {/* Architecture */}
      <div style={{ marginBottom: 50 }}>
        <div style={{ fontSize: 13, color: "#000", fontWeight: 600, marginBottom: 12 }}>Architecture & Stack</div>
        <div style={{ maxWidth: 520 }}>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>
            Built with Next.js 14 and React, the site is a single-page application where all content renders within one route. Navigation state is managed through React state and the History API, enabling browser back/forward without full page reloads.
          </p>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>
            The sidebar remains persistent across all views. Hover interactions on sidebar links trigger a leader line routing system that draws SVG connections from the label to its associated book covers in the main content area. Lines are routed through computed gap corridors between flex-wrapped rows to avoid overlapping content.
          </p>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7 }}>
            Overlays (fullscreen image viewer, PDF reader, detail panels) are rendered via React portals to escape CSS transform containment, ensuring fixed positioning works correctly regardless of parent transforms.
          </p>
        </div>
      </div>

      {/* Code: Leader Lines */}
      <CodeBlock code={codeLeaderLine} label="Leader line routing — computing gap corridors between flex-wrapped cover rows" />

      {/* CV Timeline Animation */}
      <div style={{ marginBottom: 50 }}>
        <div style={{ fontSize: 13, color: "#000", fontWeight: 600, marginBottom: 12 }}>CV Timeline Animation</div>
        <div style={{ maxWidth: 520 }}>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>
            The curriculum vitae page is built as an interactive network diagram rather than a traditional list. Each entry — education, exhibitions, awards, experience — is a node positioned on a percentage-based coordinate system (0–100 on both axes), with edges connecting related entries to show the chronological and conceptual flow of a career.
          </p>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>
            On load, nodes appear sequentially sorted by x-coordinate (left to right, earliest to latest) with a 120ms stagger between each. Each node fades in with a translateY transition. Edges animate in after both of their connected nodes are visible, using SVG stroke-dashoffset — the dash array is set to the line&apos;s computed pixel length, then the offset transitions from that length to zero, creating a drawing effect that traces the connection path.
          </p>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>
            Hovering a node highlights its connected edges and dims all unrelated content. Section categories (Education, Shows, Awards, Experience) use distinct colors and icon shapes — circles for exhibitions and experience, squares for education and awards — drawn in a persistent legend row above the diagram.
          </p>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7 }}>
            On mobile (&lt;1200px), the network diagram transforms into a chronological list grouped by year, with collapsible descriptions on tap. The layout switch uses a window-width check rather than canvas size to avoid oscillation between the two modes during resize.
          </p>
        </div>
      </div>

      {/* Code: CV Animation */}
      <CodeBlock code={codeCVAnimation} label="CV timeline — staggered node reveal and edge drawing animation" />


      {/* Interactive Features */}
      <div style={{ marginBottom: 50 }}>
        <div style={{ fontSize: 13, color: "#000", fontWeight: 600, marginBottom: 12 }}>Interactive Features</div>
        <div style={{ maxWidth: 520 }}>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>
            A custom cursor replaces the system default site-wide using a fixed-position div that tracks mouse movement, rendered with mix-blend-mode: difference for visibility against any background. The cursor maintains its z-index above all content including fullscreen overlays.
          </p>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>
            Text throughout the site is animated with a typewriter effect that reveals characters sequentially with a fading opacity window — each character transitions from transparent to opaque as the typing position advances, creating a smooth fade-in rather than a hard character-by-character pop.
          </p>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7 }}>
            The writing library renders books as 3D objects with CSS transforms: skewY(-2deg) creates a resting tilt, hover transitions to skewY(0deg) scale(1.08) with a shadow expansion. Pseudo-elements create the spine and top edge with gradient fills drawn from the site&apos;s highlight color palette.
          </p>
        </div>
      </div>

      {/* Code: 3D Book Card */}
      <CodeBlock code={codeBookCard} label="3D book card — CSS skew transform with spine pseudo-element" />

      {/* Code: Typewriter */}
      <CodeBlock code={codeTypewriter} label="TypewriterText — character-by-character reveal with opacity fade window" />


      {/* Multilingual */}
      <div style={{ marginBottom: 50 }}>
        <div style={{ fontSize: 13, color: "#000", fontWeight: 600, marginBottom: 12 }}>Multilingual System</div>
        <div style={{ maxWidth: 520 }}>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>
            The site supports seven languages — English, German, French, Korean, Indonesian, Chinese, and Japanese — with translations stored as typed Record objects keyed by language code. The language selector in the header switches all visible text simultaneously including bio, sidebar labels, exhibition captions, and UI chrome.
          </p>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7 }}>
            Exhibition pages carry their own translation sets for artwork captions (title, medium, dimensions) adapted to each locale&apos;s conventions — metric dimensions for non-English, localized medium descriptions, and culturally appropriate title translations.
          </p>
        </div>
      </div>

      {/* Responsive Design */}
      <div style={{ marginBottom: 50 }}>
        <div style={{ fontSize: 13, color: "#000", fontWeight: 600, marginBottom: 12 }}>Responsive Design</div>
        <div style={{ maxWidth: 520 }}>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>
            The site adapts to mobile with a collapsible hamburger menu replacing the persistent sidebar, simplified bio layout as a single column, and touch-optimized interactions. The CV page transforms from an interactive network diagram into a chronological list grouped by year.
          </p>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7 }}>
            Gallery pages, book covers, and exhibition images reflow to single-column layouts with adjusted spacing and typography scales using CSS clamp() for fluid sizing between breakpoints.
          </p>
        </div>
      </div>

      {/* Code: Custom Cursor */}
      <CodeBlock code={codeCursor} label="CustomCursor — fixed-position tracking with mix-blend-mode: difference" />

      {/* Footer spacer */}
      <div style={{ height: 80 }} />
    </div>
  );
}

export default function GalleryPage({
  onClose,
  title,
  inputLabel,
  lang = "en",
  onContact,
}: {
  onClose: () => void;
  title: string;
  inputLabel: string;
  lang?: Lang;
  onContact?: () => void;
}) {
  void onClose;
  const skipLoader = inputLabel === "Input_008" || inputLabel === "Input_010" || inputLabel === "Input_012" || inputLabel === "Input_013" || inputLabel === "Input_015";
  const [loaderDone, setLoaderDone] = useState(skipLoader);
  const [contentVisible, setContentVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setContentVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const isPrints = inputLabel === "Input_008";
  const isPainting = inputLabel === "Input_010";
  const isSculpture = inputLabel === "Input_011";
  const isArchive = inputLabel === "Input_012";
  const isWriting = inputLabel === "Input_013";
  const isLectures = inputLabel === "Input_014";
  const isWebUi = inputLabel === "Input_015";
  const gt = galleryTranslations[lang];

  const renderExhibition = () => {
    if (isPrints) {
      return (
        <ExhibitionPage
          lang={lang}
          images={printsImages}
          captions={printsCaptions[lang]}
          aboutTexts={galleryTranslations[lang]}
          processImages={["/Plotter_1.png", "/plotter_2.png"]}
          onContact={onContact}
        />
      );
    }
    if (isPainting) {
      return (
        <ExhibitionPage
          lang={lang}
          images={paintingImages}
          captions={paintingCaptions[lang]}
          aboutTexts={paintingTranslations[lang]}
          bounceImages={[
            paintingImages[4],
            "/original_538ad05c881302d492f7d7d82332f45d.gif",
            "/original_6c20fd1a010bb5c6e5df5789483d28e8.gif",
          ]}
          bounceImageSize={120}
          bounceContainerHeight="clamp(320px, 50vh, 400px)"
          onContact={onContact}
        />
      );
    }
    if (isWriting) {
      return <WritingLibrary lang={lang} />;
    }
    if (isLectures) {
      return <LecturesLibrary lang={lang} />;
    }
    if (isWebUi) {
      return <CaseStudyPage />;
    }
    if (isSculpture || isArchive) {
      return (
        <p style={{
          fontFamily: "var(--site-font)",
          fontSize: 18,
          color: "#bbb",
          marginTop: 40,
        }}>
          Images coming soon.
        </p>
      );
    }
    return (
      <p style={{
        fontFamily: "var(--site-font)",
        fontSize: 11,
        color: "#bbb",
      }}>
        {gt.comingSoon}
      </p>
    );
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      {!loaderDone && (
        <TextScatterLoader
          text={title}
          amount={isPrints ? 2 : isPainting ? 3 : (isWriting || isLectures) ? 3 : 6}
          fontSize={2.5}
          interval={20}
          windowSize={15}
          duration={isPrints ? 1000 : isPainting ? 1000 : 1600}
          onDone={() => setLoaderDone(true)}
        />
      )}
      {/* Header — hidden for Writing */}
      {!isWriting && !isWebUi && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "var(--site-font)",
            fontSize: 11,
            color: "#bbb",
            paddingBottom: 4,
            paddingLeft: 30,
            marginRight: 20,
          }}
        >
          <div style={{ display: "flex", gap: 20 }}>
            <span>{inputLabel}</span>
            <span>{title}</span>
          </div>
        </div>
      )}

      {/* Gallery content area */}
      <div
        style={{
          flex: 1,
          paddingTop: 14,
          paddingLeft: 30,
          paddingRight: "clamp(40px, 8vw, 160px)",
          overflowY: "auto",
          opacity: contentVisible ? 1 : 0,
          transform: contentVisible ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {renderExhibition()}
      </div>
    </div>
  );
}
