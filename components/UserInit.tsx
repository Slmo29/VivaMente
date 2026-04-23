"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/store";
import {
  initUserData,
  fetchOrCreateEserciziDelGiorno,
  fetchUserLevels,
  fetchProgressiSettimanali,
  fetchSessioniRecenti,
  fetchMessaggi,
} from "@/lib/sync";

export default function UserInit() {
  const { setUser, isGuest } = useUserStore();

  useEffect(() => {
    if (isGuest) return;

    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [data, eserciziDelGiorno, userLevels, progressiSettimanali, sessioniRecenti, messaggi] =
        await Promise.all([
          initUserData(user.id),
          fetchOrCreateEserciziDelGiorno(user.id),
          fetchUserLevels(user.id),
          fetchProgressiSettimanali(user.id),
          fetchSessioniRecenti(user.id),
          fetchMessaggi(user.id),
        ]);

      if (data) {
        setUser({
          ...data,
          eserciziDelGiorno,
          userLevels,
          progressiSettimanali,
          sessioniRecenti,
          messaggi,
          initialized: true,
        });
      } else {
        // Nessun utente autenticato — reindirizza gestito dal middleware
        setUser({ initialized: true });
      }
    }

    init();
  }, [isGuest, setUser]);

  return null;
}
