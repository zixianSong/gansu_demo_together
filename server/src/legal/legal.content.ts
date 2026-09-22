export const CUSTOMER_SERVICE = {
  phone: '0931-0000000',
  enableWxWork: true,
  hint: '工作日 9:00-18:00',
};

export const ABOUT = {
  name: '环甘肃游',
  version: '1.0.0',
  intro: '面向甘肃旅行的小程序，提供发现、订票与行程服务。',
};

export const PRIVACY_BRIEF = {
  title: '隐私政策简要版',
  subtitle: '清晰告知提供服务所需收集信息及收集方式',
  fullPolicyPath: '/api/v1/legal/privacy',
  collectScenes: [
    { key: 'account', title: '账号注册、登录', desc: '收集证件类型、证件号、姓名、手机号' },
    { key: 'consult', title: '投诉、申诉、咨询', desc: '收集账号、照片、相册中的图片/视频、沟通记录' },
    { key: 'location', title: '定位相关功能', desc: '收集位置信息' },
    { key: 'call', title: '拨打联系人电话', desc: '收集设备通话状态' },
  ],
  permissionScenes: [
    { key: 'location', title: '位置', desc: '用于便捷切换所在城市、按距离排序产品、推荐周边产品、天气查询' },
    { key: 'microphone', title: '麦克风', desc: '用于音视频通话、语音搜索、与智能助手对话' },
    { key: 'camera', title: '相机', desc: '用于扫码、拍摄' },
    { key: 'album', title: '相册', desc: '用于上传照片、保存照片' },
  ],
};

export const COLLECT_LIST = {
  updatedAt: '2026-09-18',
  effectiveAt: '2026-09-18',
  rows: [
    { scene: '账户注册、登录', dataTypes: '证件类型、证件号、姓名、手机号', purpose: '用户注册与登录过程中的认证。', method: '用户输入' },
    { scene: '投诉、申诉、咨询', dataTypes: '账号、照片、相册中的图片/视频、沟通记录', purpose: '确保账号与系统安全、提供证明材料、解决咨询并改善客服质量', method: '用户输入、小程序收集' },
    { scene: '定位相关功能', dataTypes: '位置信息', purpose: '提供精准位置服务或匹配就近服务', method: '小程序收集' },
    { scene: '拨打联系人电话', dataTypes: '设备通话状态', purpose: '提供编辑和电话拨号服务', method: '小程序收集' },
    { scene: '小程序使用过程', dataTypes: '页面浏览记录、功能点击记录', purpose: '优化产品服务、提升体验', method: '小程序收集' },
  ],
};

export const PERMISSIONS = {
  preamble: [
    '为保障小程序产品功能实现与安全运行，我们可能会申请或使用操作系统的相关权限；',
    '为保障您的知情权，我们通过下列列表将产品可能申请、使用的相关操作系统权限进行展示，您可以根据实际需要对相关权限进行管理；',
    '根据产品的升级，申请、使用权限的类型与目的可能会有变动，我们将及时根据这些变动对列表进行调整；',
    '请您知悉，我们为业务与产品的功能与安全需要，可能会使用第三方及关联方 SDK，这些第三方也可能会申请或使用相关操作系统权限；',
    '在使用产品的过程中，您可能会使用第三方开发的 H5 页面或小程序，这些第三方也可能因业务功能所必须而申请或使用相关操作系统权限。',
  ],
  rows: [
    { permission: '读写设备存储', feature: '在您选择上传或下载文件', purpose: '上传、下载文件', timing: '使用上传、下载文件相关的应用时' },
    { permission: '设备信息', feature: '获取应用安装列表、运行中的进程、设备标识、常用设备等', purpose: '关联应用唤起、行为记录、登录设备提醒等', timing: '应用启动时、第三方登录、应用分享时' },
    { permission: '读取日志文件', feature: '调试页面打印启动时间', purpose: '优化产品启动时间', timing: '应用启动时' },
    { permission: '麦克风', feature: '同意并使用录音', purpose: '音视频通话、语音搜索、与智能助手对话', timing: '使用音视频通话、语音搜索、智能助手对话时' },
    { permission: '剪切板', feature: '登录、分享', purpose: '复制、分享剪贴板中的信息，如应用链接、验证码等', timing: '验证码登录、分享时' },
    { permission: '相机', feature: '更换头像、扫一扫、上传产品评价', purpose: '获取实景照片，完成更换头像、扫码、上传评价', timing: '使用更换头像、扫一扫、上传评价功能时' },
    { permission: '相册', feature: '更换头像、上传产品评价', purpose: '选取相册照片', timing: '使用更换头像、上传评价功能时' },
    { permission: '定位', feature: '基于地理位置的服务（LBS），如切换城市', purpose: '自动切换区划、减少用户选择', timing: '使用 LBS 相关功能时' },
  ],
};

export const PRIVACY_FULL = {
  title: '隐私政策',
  contentHtml: [
    '<p>欢迎使用环甘肃游。我们重视您的个人信息与隐私保护。完整法务文本上线前，以本说明为准。</p>',
    '<p>一、我们如何收集信息</p>',
    '<p>账号注册与登录时，可能收集证件类型、证件号、姓名、手机号，用于身份认证。</p>',
    '<p>投诉、申诉、咨询时，可能收集账号、照片、相册中的图片或视频、沟通记录，用于处理问题并改善客服。</p>',
    '<p>使用定位相关功能时，可能收集位置信息，用于城市切换与周边推荐。</p>',
    '<p>拨打联系人电话时，可能使用设备通话状态，用于完成拨号。</p>',
    '<p>使用小程序过程中，可能收集页面浏览与功能点击记录，用于优化产品。</p>',
    '<p>二、权限使用</p>',
    '<p>相机、相册用于头像与评价上传；位置用于 LBS 服务；麦克风仅在您主动使用语音相关功能时申请。</p>',
    '<p>三、您的权利</p>',
    '<p>您可通过小程序内反馈投诉与我们联系。本政策更新后将在小程序内公示。</p>',
    '<p>生效日期：2026-09-18</p>',
  ].join(''),
};
