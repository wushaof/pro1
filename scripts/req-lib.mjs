export function pack(layer, block, menus) {
  const out = []
  menus.forEach((menu, mi) => {
    menu.funcs.forEach((fn, fi) => {
      out.push({
        layer,
        block,
        menuCount: String(menus.length),
        menuIndex: String(mi + 1),
        menu: menu.name,
        purpose: menu.purpose,
        funcNo: `${mi + 1}.${fi + 1}`,
        ...fn,
      })
    })
  })
  return out
}
