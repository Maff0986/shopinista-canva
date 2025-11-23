export function makeMockCanva() {
return {
intents: {
edit_design: {
render: (cb) => setTimeout(()=> cb({ editor: { notify: (m)=>console.log('mock notify',m) }, design: { insertText: async ()=>{} } }), 300)
}
},
waitUntilReady: async () => {}
}
}