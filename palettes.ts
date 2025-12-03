
import { BeadColor, Brand } from './types';
import { MARD_COLORS_MAP, MARD_BOXES, MARD_COLORS_LIST, c } from './bead_database';

// ==========================================
// 辅助工具函数
// ==========================================

// 将颜色 ID 列表转换为 BeadColor 对象列表，自动过滤无效 ID
function idsToColors(ids: string[]): BeadColor[] {
    const colors: BeadColor[] = [];
    const seen = new Set<string>();
    
    ids.forEach(id => {
        if (!seen.has(id)) {
            const color = MARD_COLORS_MAP.get(id);
            if (color) {
                colors.push(color);
                seen.add(id);
            } else {
                console.warn(`Color ID not found: ${id}`);
            }
        }
    });
    return colors;
}

// 合并多个 ID 列表
function mergeIds(...boxKeys: string[]): string[] {
    const merged: string[] = [];
    boxKeys.forEach(key => {
        if (MARD_BOXES[key]) {
            merged.push(...MARD_BOXES[key]);
        }
    });
    return merged;
}

// ==================================================================================
// Mard 品牌套装配置
// ==================================================================================

// 24色: Box 1
const PRESET_24 = idsToColors(MARD_BOXES['BOX_1']);

// 48色: 1 + 2
const PRESET_48 = idsToColors(mergeIds('BOX_1', 'BOX_2'));

// 72色: 1 + 2 + 3
const PRESET_72 = idsToColors(mergeIds('BOX_1', 'BOX_2', 'BOX_3'));

// 96色: 1 + 2 + 3 + 4
const PRESET_96 = idsToColors(mergeIds('BOX_1', 'BOX_2', 'BOX_3', 'BOX_4'));

// 120色: A + B + C + D + E
const PRESET_120_IDS = mergeIds('BOX_A', 'BOX_B', 'BOX_C', 'BOX_D', 'BOX_E');
const PRESET_120 = idsToColors(PRESET_120_IDS);

// 144色: 120 + 6
const PRESET_144 = idsToColors([...PRESET_120_IDS, ...MARD_BOXES['BOX_6']]);

// 216色: 120 + 6 + 9 + 10 + 11 (并排除特定颜色)
// 排除: C29, D10, B9, C12, D4
const EXCLUDE_216 = new Set(['C29', 'D10', 'B9', 'C12', 'D4']);
const PRESET_216_RAW = [
    ...PRESET_120_IDS, 
    ...MARD_BOXES['BOX_6'], 
    ...MARD_BOXES['BOX_9'], 
    ...MARD_BOXES['BOX_10'], 
    ...MARD_BOXES['BOX_11']
];
const PRESET_216 = idsToColors(PRESET_216_RAW.filter(id => !EXCLUDE_216.has(id)));

// 264色: 120 + 6 + 7 + 8 + 9 + 10 + 11 (并排除 C29)
const EXCLUDE_264 = new Set(['C29']);
const PRESET_264_RAW = [
    ...PRESET_120_IDS,
    ...MARD_BOXES['BOX_6'],
    ...MARD_BOXES['BOX_7'],
    ...MARD_BOXES['BOX_8'],
    ...MARD_BOXES['BOX_9'],
    ...MARD_BOXES['BOX_10'],
    ...MARD_BOXES['BOX_11']
];
const PRESET_264 = idsToColors(PRESET_264_RAW.filter(id => !EXCLUDE_264.has(id)));


export const MARD_BRAND: Brand = {
    id: 'mard',
    name: 'Mard (官方套装配置)',
    description: '官方295色全集，支持24/48/72/144等标准套装切换。',
    colors: MARD_COLORS_LIST, // 品牌全集
    presets: [
        {
            id: 'mard-24',
            name: '基础 24 色',
            description: 'Box 1',
            colors: PRESET_24
        },
        {
            id: 'mard-48',
            name: '进阶 48 色',
            description: 'Box 1+2',
            colors: PRESET_48
        },
        {
            id: 'mard-72',
            name: '高级 72 色',
            description: 'Box 1+2+3',
            colors: PRESET_72
        },
        {
            id: 'mard-96',
            name: '专业 96 色',
            description: 'Box 1+2+3+4',
            colors: PRESET_96
        },
        {
            id: 'mard-120',
            name: '大师 120 色',
            description: 'Box A+B+C+D+E',
            colors: PRESET_120
        },
        {
            id: 'mard-144',
            name: '大师 144 色 (120+6号盒)',
            description: 'Box A-E + Box 6',
            colors: PRESET_144
        },
        {
            id: 'mard-216',
            name: '全实色 216 色',
            description: '含9/10/11号补充盒 (排除部分重复/特殊色)',
            colors: PRESET_216
        },
        {
            id: 'mard-264',
            name: '全色 264 色',
            description: '含7/8号夜光/特殊盒 (排除C29)',
            colors: PRESET_264
        },
        {
            id: 'mard-full',
            name: '图纸全集 (295色)',
            description: '包含所有系列 A-ZG',
            colors: MARD_COLORS_LIST
        }
    ]
};

// ==================================================================================
// Artkal (示例品牌)
// ==================================================================================

const ARTKAL_BASE_COLORS: BeadColor[] = [
  c('S01', '#FFFFFF', 'S-白色'), c('S02', '#000000', 'S-黑色'), c('S03', '#C0C0C0', 'S-浅灰'), c('S04', '#808080', 'S-深灰'),
  c('S05', '#FF0000', 'S-大红'), c('S06', '#FF007F', 'S-玫红'), c('S07', '#FFC0CB', 'S-粉红'), c('S08', '#FFA500', 'S-橙色'),
  c('S09', '#FFFF00', 'S-黄色'), c('S10', '#FFFFE0', 'S-浅黄'), c('S11', '#008000', 'S-绿色'), c('S12', '#90EE90', 'S-嫩绿'),
];
const ARTKAL_BRAND: Brand = {
  id: 'artkal_s',
  name: 'Artkal (S系列)',
  description: '示例品牌，仅包含基础色。',
  colors: ARTKAL_BASE_COLORS,
  presets: [
    {
        id: 'ak-12',
        name: '基础 12 色',
        colors: ARTKAL_BASE_COLORS
    }
  ]
};

export const BRANDS: Brand[] = [
  MARD_BRAND,
  ARTKAL_BRAND
];
