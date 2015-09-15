package ar.com.osdepym.mobile.cartilla;

import android.location.Location;
import android.os.AsyncTask;
import android.util.Log;
import ar.com.osdepym.mobile.cartilla.dto.AfiliadoDTO;
import ar.com.osdepym.mobile.cartilla.util.ServiceManager;

public class TareaRegistrarLlamado extends AsyncTask<Void, Void, Void> {

	private static final String LOG_TAG = TareaRegistrarLlamado.class.getSimpleName();

	private AfiliadoDTO afiliado;
	private Location ubicacion;
	private ServiceManager manager;
	private String telefono;
	
	public TareaRegistrarLlamado(AfiliadoDTO afiliado, Location ubicacion, String telefono) {
		
		this.manager = new ServiceManager();
		this.afiliado = afiliado;
		this.ubicacion = ubicacion;
		this.telefono = telefono;
	}
	
	@Override
	protected Void doInBackground(Void... params) {
		
		try {

			manager.registrarLlamado(afiliado, ubicacion, telefono);
		} catch (Exception e) {
			Log.e(LOG_TAG, "Error registrando llamado en el servidor: " + e);
		}
		return null;
	}
	
	@Override
	protected void onPostExecute(Void v) {
		super.onPostExecute(v);
	}
}