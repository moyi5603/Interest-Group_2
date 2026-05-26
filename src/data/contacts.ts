// 模拟通讯录数据 (后续可替换为真实接口)

export type Employee = {
  id: string;
  name: string;
  position: string;
  avatar?: string; // 文字头像首字
  deptId: string;
};

export type Department = {
  id: string;
  name: string;
  parentId?: string;
  count: number; // 含子部门总人数
  children?: Department[];
};

export const departments: Department[] = [
  {
    id: "rd",
    name: "研发中心",
    count: 86,
    children: [
      { id: "rd-fe", name: "前端组", count: 12, parentId: "rd" },
      { id: "rd-be", name: "后端组", count: 24, parentId: "rd" },
      { id: "rd-ai", name: "AI 算法组", count: 18, parentId: "rd" },
      { id: "rd-qa", name: "测试组", count: 14, parentId: "rd" },
      { id: "rd-ops", name: "运维组", count: 8, parentId: "rd" },
    ],
  },
  {
    id: "product",
    name: "产品中心",
    count: 22,
    children: [
      { id: "product-pm", name: "产品组", count: 10, parentId: "product" },
      { id: "product-ux", name: "设计组", count: 8, parentId: "product" },
    ],
  },
  {
    id: "sales",
    name: "销售中心",
    count: 54,
    children: [
      { id: "sales-bd", name: "BD 组", count: 18, parentId: "sales" },
      { id: "sales-ksa", name: "大客户组", count: 12, parentId: "sales" },
    ],
  },
  { id: "hr", name: "人力资源部", count: 9 },
  { id: "finance", name: "财务部", count: 7 },
  { id: "admin", name: "行政部", count: 6 },
];

export const employees: Employee[] = [
  { id: "u1", name: "张敏", position: "前端工程师", deptId: "rd-fe" },
  { id: "u2", name: "李伟", position: "后端工程师", deptId: "rd-be" },
  { id: "u3", name: "王芳", position: "AI 算法专家", deptId: "rd-ai" },
  { id: "u4", name: "赵磊", position: "测试工程师", deptId: "rd-qa" },
  { id: "u5", name: "孙丽", position: "产品经理", deptId: "product-pm" },
  { id: "u6", name: "周鹏", position: "UI 设计师", deptId: "product-ux" },
  { id: "u7", name: "吴强", position: "BD 经理", deptId: "sales-bd" },
  { id: "u8", name: "郑娜", position: "HRBP", deptId: "hr" },
  { id: "u9", name: "钱进", position: "财务主管", deptId: "finance" },
  { id: "u10", name: "陈静", position: "行政专员", deptId: "admin" },
];

export const flattenDepts = (list: Department[] = departments): Department[] => {
  const out: Department[] = [];
  list.forEach((d) => {
    out.push(d);
    if (d.children) out.push(...flattenDepts(d.children));
  });
  return out;
};
