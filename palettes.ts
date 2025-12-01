
import { BeadColor, PalettePreset, RGB, Brand } from './types';

// ==========================================
// 辅助函数
// ==========================================
function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

const c = (id: string, name: string, hex: string): BeadColor => ({
  id,
  name,
  hex,
  rgb: hexToRgb(hex),
});

// ==========================================
// 品牌配置 1: Artkal (S系列硬豆)
// 这是一个偏向专业、色彩丰富的品牌
// ==========================================

const ARTKAL_MASTER_COLORS: BeadColor[] = [
  c('S01', '白色', '#FFFFFF'),
  c('S02', '黑色', '#000000'),
  c('S03', '浅灰', '#C0C0C0'),
  c('S04', '深灰', '#808080'),
  c('S05', '大红', '#FF0000'),
  c('S06', '玫瑰红', '#FF007F'),
  c('S07', '粉红', '#FFC0CB'),
  c('S08', '橙色', '#FFA500'),
  c('S09', '黄色', '#FFFF00'),
  c('S10', '浅黄', '#FFFFE0'),
  c('S11', '绿色', '#008000'),
  c('S12', '嫩绿', '#90EE90'),
  c('S13', '天蓝', '#87CEEB'),
  c('S14', '深蓝', '#00008B'),
  c('S15', '紫色', '#800080'),
  c('S16', '浅紫', '#DDA0DD'),
  c('S17', '棕色', '#A52A2A'),
  c('S18', '肉色', '#FFDAB9'),
  c('S19', '透明', '#F0F8FF'),
  c('S20', '荧光绿', '#00FF00'),
  c('S21', '荧光橙', '#FF4500'),
  c('S22', '荧光粉', '#FF69B4'),
  c('S23', '奶油', '#FFFDD0'),
  c('S24', '薄荷', '#98FB98'),
  // 模拟扩展到 72 色 (此处为代码简洁省略部分，实际配置可写满)
  c('S25', '薰衣草', '#E6E6FA'),
  c('S26', '海军蓝', '#000080'),
  c('S27', '蓝绿', '#008080'),
  c('S28', '橄榄', '#808000'),
  c('S29', '紫红', '#C71585'),
  c('S30', '赭石', '#A0522D'),
];

// 自动填充 Artkal 剩余颜色以模拟大数据集
for(let i=31; i<=144; i++) {
   const base = ARTKAL_MASTER_COLORS[i % 30];
   ARTKAL_MASTER_COLORS.push(c(`S${i}`, `${base.name}-变体`, base.hex)); 
   // 在真实场景中，这里应手动配置真实的 Hex
}

const ARTKAL_BRAND: Brand = {
  id: 'artkal_s',
  name: 'Artkal (S系列硬豆)',
  description: '色彩丰富，适合专业像素画，融合度高。',
  colors: ARTKAL_MASTER_COLORS,
  presets: [
    {
      id: 'ak-24',
      name: '新手包 24 色',
      description: '基础常用色',
      colors: ARTKAL_MASTER_COLORS.slice(0, 24),
    },
    {
      id: 'ak-72',
      name: '进阶装 72 色',
      description: '标准全色系，覆盖大部分需求',
      colors: ARTKAL_MASTER_COLORS.slice(0, 72),
    },
    {
      id: 'ak-144',
      name: '大师级 144 色',
      description: '极致色彩表现',
      colors: ARTKAL_MASTER_COLORS.slice(0, 144),
    }
  ]
};

// ==========================================
// 品牌配置 2: Perler (P系列)
// 这是一个经典的美国品牌，色号系统完全不同
// ==========================================

const PERLER_MASTER_COLORS: BeadColor[] = [
  c('P01', 'White', '#F5F5F5'), // Perler 的白稍微暖一点
  c('P02', 'Black', '#1A1A1A'),
  c('P03', 'Yellow', '#FFD700'),
  c('P04', 'Orange', '#FF8C00'),
  c('P05', 'Red', '#DC143C'),
  c('P06', 'Purple', '#8A2BE2'),
  c('P07', 'Dark Blue', '#0000CD'),
  c('P08', 'Light Blue', '#ADD8E6'),
  c('P09', 'Dark Green', '#006400'),
  c('P10', 'Light Green', '#90EE90'),
  c('P11', 'Brown', '#8B4513'),
  c('P12', 'Grey', '#808080'),
  c('P13', 'Pink', '#FFB6C1'),
  c('P14', 'Magenta', '#FF00FF'),
  c('P15', 'Cheddar', '#FFA07A'),
  c('P16', 'Toothpaste', '#00CED1'),
  c('P17', 'Hot Coral', '#FF6347'),
  c('P18', 'Plum', '#DDA0DD'),
  c('P19', 'Kiwi Lime', '#ADFF2F'),
  c('P20', 'Turquoise', '#40E0D0'),
];

// 自动填充 Perler 剩余颜色
for(let i=21; i<=60; i++) {
   const base = PERLER_MASTER_COLORS[i % 20];
   PERLER_MASTER_COLORS.push(c(`P${i}`, `${base.name} V2`, base.hex)); 
}

const PERLER_BRAND: Brand = {
  id: 'perler_c',
  name: 'Perler (经典系列)',
  description: '美式经典品牌，颜色鲜艳，融合后质感较硬。',
  colors: PERLER_MASTER_COLORS,
  presets: [
    {
      id: 'pl-12',
      name: '基础 12 色',
      description: '核心基础色',
      colors: PERLER_MASTER_COLORS.slice(0, 12),
    },
    {
      id: 'pl-48',
      name: '标准 48 色',
      description: 'Perler 常用桶装配置',
      colors: PERLER_MASTER_COLORS.slice(0, 48),
    }
  ]
};

// ==========================================
// 品牌配置 3: 灰度专用 (通用)
// ==========================================
const GRAY_COLORS: BeadColor[] = [
    c('G01', '极白', '#FFFFFF'),
    c('G02', '亮灰', '#E0E0E0'),
    c('G03', '浅灰', '#C0C0C0'),
    c('G04', '中灰', '#A0A0A0'),
    c('G05', '灰', '#808080'),
    c('G06', '深灰', '#606060'),
    c('G07', '炭灰', '#404040'),
    c('G08', '极黑', '#000000'),
];

const MONO_BRAND: Brand = {
    id: 'mono',
    name: '灰度专用系列',
    description: '仅包含黑白灰，用于复古照片风格',
    colors: GRAY_COLORS,
    presets: [{
        id: 'mono-8',
        name: '标准 8 阶灰度',
        colors: GRAY_COLORS
    }]
};

// ==========================================
// 导出所有品牌配置
// ==========================================

export const BRANDS: Brand[] = [
  ARTKAL_BRAND,
  PERLER_BRAND,
  MONO_BRAND
];
