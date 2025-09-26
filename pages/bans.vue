<template>
  <div class="bans-page">
    <h1>封禁列表</h1>
    <div v-if="!modules?.enable_litebans" class="disabled">
      <p>LiteBans 模块未启用。</p>
    </div>
    <div v-else>
      <el-alert v-if="list?.error" :title="String(list.error)" type="error" show-icon style="margin-bottom:12px" />
      <el-table :data="bans" style="width: 100%">
        <el-table-column label="类型" width="100" align="center" header-align="center">
          <template #default="{ row }"><el-tag :type="row.type === 'ban' ? 'danger' : 'warning'" effect="plain">{{ row.type === 'ban' ? '封禁' : '禁言' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="玩家" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <div class="user-cell">
              <img :src="avatarByName(row.name)" :alt="row.name || '玩家'" class="avatar" />
              <span class="nick">{{ row.name || '未知玩家' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="执行人" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <div class="user-cell">
              <img :src="avatarByName(row.by)" :alt="row.by || '执行人'" class="avatar" />
              <span class="nick">{{ row.by || '控制台' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" />
        <el-table-column label="开始时间" width="200">
          <template #default="{ row }">{{ formatTime(row.time) }}</template>
        </el-table-column>
        <el-table-column label="过期时间" width="200">
          <template #default="{ row }">{{ row.until && row.until > 0 ? formatTime(row.until) : '永久' }}</template>
        </el-table-column>
        <el-table-column prop="active" label="状态" width="100">
          <template #default="{ row }"><el-tag :type="row.active ? 'danger' : 'info'">{{ row.active ? '生效中' : '已解除' }}</el-tag></template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination
          layout="prev, pager, next, jumper"
          :page-size="pageSize"
          :current-page="page"
          :total="total"
          @current-change="onPageChange"
        />
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
type ModulesFlags = { enable_litebans: boolean }
type Ban = { type: 'ban' | 'mute'; uuid: string; name: string; reason: string; byUuid?: string; by: string; time: number; until: number | null; active: boolean }
type BanListResp = { enabled: boolean; bans: Ban[]; error?: string; page: number; pageSize: number; total: number }

const { data: modules } = await useAsyncData('modules', () => $fetch<ModulesFlags>('/api/modules'))
const route = useRoute()
const page = computed(() => Number(route.query.page || 1))
const pageSize = computed(() => 20)
const { data: list, refresh } = await useAsyncData('lb-list', () => $fetch<BanListResp>(`/api/litebans/list?page=${page.value}&pageSize=${pageSize.value}`), { watch: [page] })
const bans = computed(() => list.value?.bans || [])
const total = computed(() => list.value?.total || 0)

function onPageChange(p: number) {
  navigateTo({ path: '/bans', query: { page: p } })
}

function formatTime(ts: number) {
  if (!ts) return '-'
  const d = new Date(Number(ts))
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function avatarByName(name?: string) {
  const id = name && name.trim() ? name : 'Steve'
  return `https://crafthead.net/avatar/${encodeURIComponent(id)}`
}
</script>

<style>
.bans-page { 
  padding: 16px; 
  color: var(--fg);
  background: var(--panel);
  border-radius: 12px;
  box-shadow: 0 2px 6px color-mix(in oklab, var(--fg) 10%, transparent);
  max-width: 1120px;
  margin: 16px auto;
}

/* LiteBans未启用提示 */
.disabled { 
  color: var(--muted); 
  background: color-mix(in oklab, var(--panel) 80%, transparent); 
  border: 1px solid var(--border);
  padding: 12px;
  border-radius: 8px;
}

/* 分页器 */
.pager { 
  display: flex; 
  justify-content: center; 
  margin-top: 12px; 
}

/* 玩家/执行人单元格：头像上、名字下 */
.user-cell { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 4px 0; width: 100%; }
.avatar { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 1px 3px color-mix(in oklab, var(--fg) 15%, transparent); background: var(--panel); }
.nick { font-weight: 600; color: var(--fg); line-height: 1; max-width: 100px; text-align: center; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }

/* ======================
   Element Plus 表格主题适配
   ====================== */
.el-table {
  --el-table-border-color: var(--border);
  --el-table-bg-color: var(--panel);
  --el-table-tr-bg-color: var(--panel);
  --el-table-text-color: var(--fg);
  --el-table-header-bg-color: color-mix(in oklab, var(--panel) 95%, var(--fg) 5%);
  --el-table-header-text-color: var(--fg);
  --el-table-row-hover-bg-color: color-mix(in oklab, var(--fg) 10%, transparent);
}

/* 表格 body 区域兼容 */
.el-table__body tr td {
  background: var(--panel);
  color: var(--fg);
  border-bottom: 1px solid var(--border);
}

/* 悬停行效果 */
.el-table__body tr:hover > td {
  background: color-mix(in oklab, var(--fg) 8%, var(--panel));
}
/* 分页器整体容器 */
.el-pagination {
  --el-pagination-bg-color: var(--panel);
  --el-pagination-text-color: var(--fg);
  --el-pagination-button-color: var(--fg);
  --el-pagination-hover-color: color-mix(in oklab, var(--fg) 15%, transparent);
}

/* 每个按钮 */
.el-pagination button,
.el-pagination .el-pager li {
  background: var(--panel);
  color: var(--fg);
  border: 1px solid var(--border);
  border-radius: 6px;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

 /* 上/下一页图标颜色 */
 .el-pagination .btn-prev .el-icon,
 .el-pagination .btn-next .el-icon { color: var(--fg); }

 /* 跳页输入框与文案 */
 .el-pagination .el-pagination__editor .el-input__wrapper { background: var(--panel); border: 1px solid var(--border); box-shadow: none; }
 .el-pagination .el-pagination__editor .el-input__inner { color: var(--fg); }
 .el-pagination .el-pagination__total,
 .el-pagination .el-pagination__jump { color: var(--fg); }

/* 鼠标悬停时 */
.el-pagination button:hover,
.el-pagination .el-pager li:hover {
  background: color-mix(in oklab, var(--fg) 8%, var(--panel));
  color: var(--fg);
  border-color: color-mix(in oklab, var(--fg) 20%, var(--border));
}

/* 当前页按钮 */
.el-pagination .el-pager li.is-active {
  background: color-mix(in oklab, var(--fg) 85%, #3b82f6 15%);
  color: #0b1219;
  border-color: color-mix(in oklab, var(--fg) 85%, #3b82f6 15%);
  font-weight: 700;
}

</style>