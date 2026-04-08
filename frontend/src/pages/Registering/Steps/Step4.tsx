export function Enterprise_Registering_Step_4(){

}
export function NPO_Registering_Step_4(){
    return <div className="space-y-4">
          <h6 className="font-semibold text-[#00467F]">Informações básicas</h6>
          <div>
            <label className="block text-black mb-1">
              Telefone
              <span className="text-gray-500 ml-1">(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Digite o telefone"
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#F3F3F5]"
            />
          </div>
          <div>
            <label className="block text-black mb-1">
              Endereço
              <span className="text-gray-500 ml-1">(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Digite o endereço"
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#F3F3F5]"
            />
          </div>
        </div>
    
}