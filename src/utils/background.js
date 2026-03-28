const sel = window.getSelection()
for (let i = 0; i < sel.rangCount; i++) {
    range[i] = sel.getRangeAt(i)
}