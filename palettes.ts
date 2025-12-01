
import { BeadColor, PalettePreset, RGB, Brand } from './types';

// ==========================================
// 辅助工具函数
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

// 快速创建颜色的辅助函数
const c = (id: string, name: string, hex: string): BeadColor => ({
  id,
  name,
  hex,
  rgb: hexToRgb(hex),
});

// 辅助函数：合并多个颜色数组并去重（防止ID冲突，以后面为准）
function mergeColors(...boxes: BeadColor[][]): BeadColor[] {
    const map = new Map<string, BeadColor>();
    boxes.forEach(box => {
        box.forEach(color => map.set(color.id, color));
    });
    return Array.from(map.values());
}

// ==================================================================================
// 品牌配置 1: Mard (玛德) - 演示“盒子叠加”逻辑
// 逻辑：Box A 是基础，Box B 是扩展，Box C 是高阶。
// 套装通过组合这些 Box 生成。
// ==================================================================================

// --- 定义积木块 (颜色盒) ---

// 盒子 A：基础 24 色 (常用色)
const MARD_BOX_A: BeadColor[] = [
    c('M01', '纯白', '#FFFFFF'), c('M02', '纯黑', '#000000'), c('M03', '奶油黄', '#FFFDD0'), c('M04', '柠檬黄', '#FFFF00'),
    c('M05', '落日橙', '#FFA500'), c('M06', '朱红', '#FF4500'), c('M07', '正红', '#FF0000'), c('M08', '玫瑰红', '#DC143C'),
    c('M09', '桃粉', '#FF69B4'), c('M10', '浅粉', '#FFB6C1'), c('M11', '紫罗兰', '#EE82EE'), c('M12', '深紫', '#800080'),
    c('M13', '深蓝', '#00008B'), c('M14', '宝蓝', '#4169E1'), c('M15', '天蓝', '#87CEEB'), c('M16', '湖蓝', '#00CED1'),
    c('M17', '翠绿', '#00FF7F'), c('M18', '草绿', '#32CD32'), c('M19', '深绿', '#006400'), c('M20', '橄榄绿', '#808000'),
    c('M21', '棕色', '#A52A2A'), c('M22', '浅棕', '#D2691E'), c('M23', '肉色', '#FFDAB9'), c('M24', '灰色', '#808080'),
];

// 盒子 B：进阶 24 色 (补充中间色和特殊色)
const MARD_BOX_B: BeadColor[] = [
    c('M25', '荧光黄', '#CCFF00'), c('M26', '姜黄', '#E6C35C'), c('M27', '珊瑚色', '#FF7F50'), c('M28', '酒红', '#8B0000'),
    c('M29', '胭脂粉', '#C71585'), c('M30', '藕荷色', '#D8BFD8'), c('M31', '薰衣草', '#E6E6FA'), c('M32', '群青', '#483D8B'),
    c('M33', '普蓝', '#191970'), c('M34', '孔雀蓝', '#008080'), c('M35', '薄荷绿', '#98FB98'), c('M36', '墨绿', '#2F4F4F'),
    c('M37', '巧克力', '#D2691E'), c('M38', '摩卡', '#8B4513'), c('M39', '沙色', '#F4A460'), c('M40', '象牙白', '#FFFFF0'),
    c('M41', '银灰', '#C0C0C0'), c('M42', '铁灰', '#696969'), c('M43', '夜光白', '#F0FFF0'), c('M44', '透明', '#F0F8FF'),
    c('M45', '霓虹绿', '#39FF14'), c('M46', '霓虹粉', '#FF10F0'), c('M47', '金棕', '#DAA520'), c('M48', '青古铜', '#CD853F'),
];

// 盒子 C：大师 24 色 (丰富的灰度和肤色系)
const MARD_BOX_C: BeadColor[] = [
    c('M49', '肤色A', '#FFE4C4'), c('M50', '肤色B', '#FFDEAD'), c('M51', '肤色C', '#DEB887'), c('M52', '肤色D', '#BC8F8F'),
    c('M53', '冷灰1', '#DCDCDC'), c('M54', '冷灰2', '#D3D3D3'), c('M55', '冷灰3', '#A9A9A9'), c('M56', '暖灰1', '#E6E6FA'),
    c('M57', '复古蓝', '#5F9EA0'), c('M58', '芥末黄', '#BDB76B'), c('M59', '砖红', '#B22222'), c('M60', '紫藤', '#9932CC'),
    c('M61', '午夜蓝', '#191970'), c('M62', '海泡绿', '#20B2AA'), c('M63', '森林绿', '#228B22'), c('M64', '酸橙', '#32CD32'),
    c('M65', '三文鱼', '#FA8072'), c('M66', '兰花紫', '#DA70D6'), c('M67', ' slate', '#708090'), c('M68', '暗 slate', '#2F4F4F'),
    c('M69', '淡紫红', '#DB7093'), c('M70', '番茄红', '#FF6347'), c('M71', '浅海绿', '#20B2AA'), c('M72', '亚麻', '#FAF0E6'),
];

// --- 组装套装 (自动逻辑) ---

const MARD_SET_24 = MARD_BOX_A;
const MARD_SET_48 = mergeColors(MARD_BOX_A, MARD_BOX_B);
const MARD_SET_72 = mergeColors(MARD_BOX_A, MARD_BOX_B, MARD_BOX_C);

export const MARD_BRAND: Brand = {
    id: 'mard',
    name: 'Mard (玛德经典)',
    description: '采用盒子叠加逻辑：购买48色相当于拥有了A盒和B盒。',
    // 品牌总色表 (包含所有已定义的盒子)
    colors: MARD_SET_72,
    presets: [
        {
            id: 'mard-24',
            name: '入门盒 (A盒)',
            description: '仅包含 Box A (24色)',
            colors: MARD_SET_24
        },
        {
            id: 'mard-48',
            name: '进阶组 (A+B盒)',
            description: '包含 Box A 和 Box B (48色)',
            colors: MARD_SET_48
        },
        {
            id: 'mard-72',
            name: '大师组 (A+B+C盒)',
            description: '包含 Box A, B 和 C (72色)',
            colors: MARD_SET_72
        }
    ]
};


// ==================================================================================
// 品牌配置 2: Artkal (S系列) - 保持原有的大列表风格 (作为对比)
// ==================================================================================

// 模拟 Artkal 的基础数据
const ARTKAL_BASE_COLORS: BeadColor[] = [
  c('S01', 'S-白色', '#FFFFFF'), c('S02', 'S-黑色', '#000000'), c('S03', 'S-浅灰', '#C0C0C0'), c('S04', 'S-深灰', '#808080'),
  c('S05', 'S-大红', '#FF0000'), c('S06', 'S-玫红', '#FF007F'), c('S07', 'S-粉红', '#FFC0CB'), c('S08', 'S-橙色', '#FFA500'),
  c('S09', 'S-黄色', '#FFFF00'), c('S10', 'S-浅黄', '#FFFFE0'), c('S11', 'S-绿色', '#008000'), c('S12', 'S-嫩绿', '#90EE90'),
  c('S13', 'S-天蓝', '#87CEEB'), c('S14', 'S-深蓝', '#00008B'), c('S15', 'S-紫色', '#800080'), c('S16', 'S-浅紫', '#DDA0DD'),
  c('S17', 'S-棕色', '#A52A2A'), c('S18', 'S-肉色', '#FFDAB9'), c('S19', 'S-透明', '#F0F8FF'), c('S20', 'S-荧光绿', '#00FF00'),
  c('S21', 'S-荧光橙', '#FF4500'), c('S22', 'S-荧光粉', '#FF69B4'), c('S23', 'S-奶油', '#FFFDD0'), c('S24', 'S-薄荷', '#98FB98'),
  c('S25', 'S-薰衣草', '#E6E6FA'), c('S26', 'S-海军蓝', '#000080'), c('S27', 'S-蓝绿', '#008080'), c('S28', 'S-橄榄', '#808000'),
  c('S29', 'S-紫红', '#C71585'), c('S30', 'S-赭石', '#A0522D'),
];
// 填充更多颜色以模拟大色库
const ARTKAL_EXTENDED = [...ARTKAL_BASE_COLORS];
for(let i=31; i<=144; i++) {
   const base = ARTKAL_BASE_COLORS[i % 30];
   ARTKAL_EXTENDED.push(c(`S${i}`, `${base.name}-${i}`, base.hex)); 
}

const ARTKAL_BRAND: Brand = {
  id: 'artkal_s',
  name: 'Artkal (S系列硬豆)',
  description: '专业级色域，适合细腻的相片转绘。',
  colors: ARTKAL_EXTENDED,
  presets: [
    {
      id: 'ak-24',
      name: '新手包 24 色',
      colors: ARTKAL_EXTENDED.slice(0, 24),
    },
    {
      id: 'ak-72',
      name: '标准 72 色',
      colors: ARTKAL_EXTENDED.slice(0, 72),
    },
    {
      id: 'ak-144',
      name: '全套 144 色',
      colors: ARTKAL_EXTENDED.slice(0, 144),
    }
  ]
};

// ==================================================================================
// 品牌配置 3: Perler (P系列) - 经典美式
// ==================================================================================

const PERLER_CORE = [
  c('P01', 'P-White', '#F5F5F5'), c('P02', 'P-Black', '#1A1A1A'), c('P03', 'P-Yellow', '#FFD700'), c('P04', 'P-Orange', '#FF8C00'),
  c('P05', 'P-Red', '#DC143C'), c('P06', 'P-Purple', '#8A2BE2'), c('P07', 'P-DarkBlue', '#0000CD'), c('P08', 'P-LightBlue', '#ADD8E6'),
  c('P09', 'P-DarkGreen', '#006400'), c('P10', 'P-LightGreen', '#90EE90'), c('P11', 'P-Brown', '#8B4513'), c('P12', 'P-Grey', '#808080'),
  c('P13', 'P-Pink', '#FFB6C1'), c('P14', 'P-Magenta', '#FF00FF'), c('P15', 'P-Cheddar', '#FFA07A'), c('P16', 'P-Toothpaste', '#00CED1')
];
const PERLER_FULL = [...PERLER_CORE];
for(let i=17; i<=48; i++) PERLER_FULL.push(c(`P${i}`, `P-Color${i}`, PERLER_CORE[i%16].hex));

const PERLER_BRAND: Brand = {
  id: 'perler_c',
  name: 'Perler (经典系列)',
  description: '美式粗犷风格，颜色鲜艳饱和。',
  colors: PERLER_FULL,
  presets: [
    {
      id: 'pl-16',
      name: '基础 16 色',
      colors: PERLER_FULL.slice(0, 16),
    },
    {
      id: 'pl-48',
      name: '桶装 48 色',
      colors: PERLER_FULL.slice(0, 48),
    }
  ]
};

// ==================================================================================
// 导出
// ==================================================================================

export const BRANDS: Brand[] = [
  MARD_BRAND,
  ARTKAL_BRAND,
  PERLER_BRAND
];
