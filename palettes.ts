
import { BeadColor, PalettePreset, RGB, BrandConfig } from './types';

// ==========================================
// 辅助函数：Hex 转 RGB
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

// 辅助函数：快速创建颜色定义
// id: 色号 (图纸上显示的文字)
// name: 颜色名称 (统计清单显示的文字)
// hex: 颜色值
const c = (id: string, name: string, hex: string): BeadColor => ({
  id,
  name,
  hex,
  rgb: hexToRgb(hex),
});

// ==========================================
// 1. 颜色库配置 (Master Color Library)
// 您可以在这里配置所有的颜色、ID 和 Hex 值
// ==========================================

// 模拟一个完整的大师级色系 (Artkal/Perler 风格)
const MASTER_LIBRARY = [
  // --- 黑白灰系列 ---
  c('S01', '白色', '#FFFFFF'),
  c('S02', '黑色', '#000000'),
  c('S03', '浅灰', '#D3D3D3'),
  c('S04', '灰色', '#808080'),
  c('S05', '深灰', '#555555'),
  c('S06', '炭黑', '#333333'),
  c('S07', '乳白', '#FFFDD0'),
  c('S08', '透明', '#F0F8FF'),

  // --- 红色/粉色系列 ---
  c('R01', '大红', '#FF0000'),
  c('R02', '深红', '#8B0000'),
  c('R03', '酒红', '#800000'),
  c('R04', '玫瑰红', '#FF007F'),
  c('R05', '粉红', '#FFC0CB'),
  c('R06', '亮粉', '#FF69B4'),
  c('R07', '热粉', '#FF1493'),
  c('R08', '桃红', '#EE82EE'),
  c('R09', '肉粉', '#FA8072'),
  c('R10', '珊瑚红', '#FF7F50'),
  c('R11', '胭脂红', '#DC143C'),
  c('R12', '三文鱼', '#FA8072'),

  // --- 橙色/黄色系列 ---
  c('O01', '橙色', '#FFA500'),
  c('O02', '深橙', '#FF8C00'),
  c('O03', '焦橙', '#CC5500'),
  c('O04', '橘黄', '#FFD700'),
  c('Y01', '柠檬黄', '#FFFF00'),
  c('Y02', '蛋黄', '#FFCC00'),
  c('Y03', '淡黄', '#FFFFE0'),
  c('Y04', '土黄', '#DAA520'),
  c('Y05', '杏色', '#FFEBCD'),
  c('Y06', '荧光黄', '#CCFF00'),

  // --- 绿色系列 ---
  c('G01', '绿色', '#008000'),
  c('G02', '深绿', '#006400'),
  c('G03', '草绿', '#7CFC00'),
  c('G04', '酸橙绿', '#32CD32'),
  c('G05', '薄荷绿', '#98FB98'),
  c('G06', '橄榄绿', '#808000'),
  c('G07', '墨绿', '#2F4F4F'),
  c('G08', '海藻绿', '#2E8B57'),
  c('G09', '荧光绿', '#00FF00'),
  c('G10', '松石绿', '#40E0D0'),
  c('G11', '青瓷', '#AFEEEE'),
  c('G12', '苹果绿', '#8DB600'),

  // --- 蓝色系列 ---
  c('B01', '蓝色', '#0000FF'),
  c('B02', '深蓝', '#00008B'),
  c('B03', '海军蓝', '#000080'),
  c('B04', '天蓝', '#87CEEB'),
  c('B05', '浅蓝', '#ADD8E6'),
  c('B06', '宝蓝', '#4169E1'),
  c('B07', '青色', '#00FFFF'),
  c('B08', '孔雀蓝', '#008080'),
  c('B09', '午夜蓝', '#191970'),
  c('B10', '钢蓝', '#4682B4'),
  c('B11', '冰蓝', '#F0F8FF'),
  c('B12', '电光蓝', '#7DF9FF'),

  // --- 紫色系列 ---
  c('P01', '紫色', '#800080'),
  c('P02', '深紫', '#4B0082'),
  c('P03', '紫罗兰', '#EE82EE'),
  c('P04', '薰衣草', '#E6E6FA'),
  c('P05', '洋红', '#FF00FF'),
  c('P06', '梅红', '#DDA0DD'),
  c('P07', '葡萄紫', '#663399'),
  c('P08', '丁香', '#C8A2C8'),

  // --- 棕色/大地色系列 ---
  c('BR1', '棕色', '#A52A2A'),
  c('BR2', '深棕', '#5C4033'),
  c('BR3', '巧克力', '#D2691E'),
  c('BR4', '卡其', '#F0E68C'),
  c('BR5', '米色', '#F5F5DC'),
  c('BR6', '沙色', '#C2B280'),
  c('BR7', '赭石', '#CC7722'),
  c('BR8', '红棕', '#804000'),
  c('BR9', '小麦', '#F5DEB3'),
  
  // --- 肤色系列 ---
  c('SK1', '肤色', '#FFE0BD'),
  c('SK2', '浅肤', '#FFCD94'),
  c('SK3', '深肤', '#EAC086'),
  c('SK4', '晒黑', '#D2B48C'),
];

// 为了演示 144 色，如果上面的列表不够，我们程序生成补足
// 在实际配置文件中，您可以手动列出所有 144 个特定的颜色
const fillTo144 = (): BeadColor[] => {
  const current = [...MASTER_LIBRARY];
  let i = 1;
  while (current.length < 144) {
    const base = MASTER_LIBRARY[i % MASTER_LIBRARY.length];
    // 生成变体
    const factor = i % 2 === 0 ? 1.2 : 0.8; 
    const r = Math.min(255, Math.floor(base.rgb.r * factor));
    const g = Math.min(255, Math.floor(base.rgb.g * factor));
    const b = Math.min(255, Math.floor(base.rgb.b * factor));
    const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    
    current.push(c(`X${i}`, `${base.name}-变体${i}`, hex));
    i++;
  }
  return current;
};

const FULL_144_SET = fillTo144();


// ==========================================
// 2. 套装/配置定义 (Palette Presets)
// 这里定义用户可以在下拉菜单中选择的选项
// ==========================================

export const PALETTE_PRESETS: PalettePreset[] = [
  {
    id: 'basic-48',
    name: '基础入门 48 色',
    description: '适合新手，包含最常用的基础色',
    // 取前 48 个颜色
    colors: FULL_144_SET.slice(0, 48),
  },
  {
    id: 'standard-72',
    name: '标准进阶 72 色',
    description: '标准配置，色彩覆盖更全面',
    // 取前 72 个颜色
    colors: FULL_144_SET.slice(0, 72),
  },
  {
    id: 'expert-144',
    name: '大师专业 144 色',
    description: '全色系，色彩过渡细腻',
    // 使用全部 144 个颜色
    colors: FULL_144_SET.slice(0, 144),
  },
  {
    id: 'grayscale',
    name: '黑白灰专用 (12色)',
    description: '用于制作黑白复古风格',
    // 过滤出所有黑白灰的颜色
    colors: FULL_144_SET.filter(c => 
      c.name.includes('黑') || 
      c.name.includes('白') || 
      c.name.includes('灰') ||
      c.id.startsWith('S') // 假设 S 系列是灰度
    ),
  }
];

// 如果您有多套配置（例如不同品牌的色号系统），可以再定义一组 presets
// 并在 UI 中增加“品牌”选择器。目前为了简化，我们将其统一放在预设列表中。
