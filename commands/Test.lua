-- fxmanifest.lua
fx_version 'cerulean'
game 'gta5'

author 'YourName'
description 'Admin /nduty command with ox_lib menu integration'
version '1.0.0'

shared_script '@ox_lib/init.lua'
client_script 'client.lua'
server_script 'server.lua'

lua54 'yes'

-- server.lua
ESX = nil

TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)

-- Check if a player is admin
ESX.RegisterServerCallback('nduty:isAdmin', function(source, cb)
    local xPlayer = ESX.GetPlayerFromId(source)
    if xPlayer.getGroup() == 'admin' or xPlayer.getGroup() == 'superadmin' then
        cb(true)
    else
        cb(false)
    end
end)

RegisterServerEvent('nduty:setPed')
AddEventHandler('nduty:setPed', function(targetId, pedName)
    local xPlayer = ESX.GetPlayerFromId(source)
    if xPlayer.getGroup() == 'admin' or xPlayer.getGroup() == 'superadmin' then
        TriggerClientEvent('nduty:changePed', targetId, pedName)
    else
        TriggerClientEvent('ox_lib:notify', source, {type = 'error', description = 'You are not authorized to use this command.'})
    end
end)

RegisterServerEvent('nduty:teleportToVehicle')
AddEventHandler('nduty:teleportToVehicle', function(targetId)
    local xPlayer = ESX.GetPlayerFromId(source)
    if xPlayer.getGroup() == 'admin' or xPlayer.getGroup() == 'superadmin' then
        TriggerClientEvent('nduty:teleportToPlayerVehicle', source, targetId)
    else
        TriggerClientEvent('ox_lib:notify', source, {type = 'error', description = 'You are not authorized to use this command.'})
    end
end)

-- client.lua
local isAdmin = false
local blipsVisible = false
local thermalMode = false

-- Check admin status
CreateThread(function()
    ESX.TriggerServerCallback('nduty:isAdmin', function(result)
        isAdmin = result
    end)
end)

RegisterCommand('nduty', function()
    if isAdmin then
        lib.registerContext({
            id = 'nduty_menu',
            title = '/nduty Menu',
            options = {
                {
                    title = 'On Duty',
                    description = 'Become invincible and enable anti-ragdoll.',
                    event = 'nduty:onDuty'
                },
                {
                    title = 'Off Duty',
                    description = 'Return to normal mode.',
                    event = 'nduty:offDuty'
                },
                {
                    title = 'Player Blips',
                    description = 'Toggle blips for all players on the minimap.',
                    event = 'nduty:toggleBlips'
                },
                {
                    title = 'Admin Ped',
                    description = 'Change to a custom admin ped.',
                    event = 'nduty:adminPed'
                },
                {
                    title = 'Thermal Mode',
                    description = 'Toggle thermal vision.',
                    event = 'nduty:toggleThermal'
                },
                {
                    title = 'Set Ped',
                    description = 'Set ped for another player.',
                    args = {'playerId', 'pedName'},
                    event = 'nduty:setPed'
                },
                {
                    title = 'Teleport to Vehicle',
                    description = 'Teleport to another player's vehicle.',
                    args = {'playerId'},
                    event = 'nduty:teleportToVehicle'
                },
                {
                    title = 'Vehicle Options',
                    description = 'Open submenu for vehicle customization.',
                    menu = 'vehicle_menu'
                }
            }
        })
        lib.showContext('nduty_menu')
    else
        lib.notify({type = 'error', description = 'You are not authorized to use this command.'})
    end
end)

RegisterNetEvent('nduty:onDuty', function()
    SetEntityInvincible(PlayerPedId(), true)
    SetPedCanRagdoll(PlayerPedId(), false)
    lib.notify({type = 'success', description = 'You are now On Duty!'})
end)

RegisterNetEvent('nduty:offDuty', function()
    SetEntityInvincible(PlayerPedId(), false)
    SetPedCanRagdoll(PlayerPedId(), true)
    lib.notify({type = 'success', description = 'You are now Off Duty.'})
end)

RegisterNetEvent('nduty:toggleBlips', function()
    blipsVisible = not blipsVisible
    if blipsVisible then
        for _, player in ipairs(GetActivePlayers()) do
            local ped = GetPlayerPed(player)
            local blip = AddBlipForEntity(ped)
            SetBlipColour(blip, 1)
            SetBlipNameToPlayerName(blip, player)
        end
    else
        RemoveBlip(blip)
    end
    lib.notify({type = 'success', description = blipsVisible and 'Blips enabled!' or 'Blips disabled!'})
end)

RegisterNetEvent('nduty:adminPed', function()
    local pedModel = `s_m_m_fibsec_01` -- Custom ped model
    RequestModel(pedModel)
    while not HasModelLoaded(pedModel) do
        Wait(10)
    end
    SetPlayerModel(PlayerId(), pedModel)
    lib.notify({type = 'success', description = 'You are now using the admin ped!'})
end)

RegisterNetEvent('nduty:toggleThermal', function()
    thermalMode = not thermalMode
    SetSeethrough(thermalMode)
    lib.notify({type = 'success', description = thermalMode and 'Thermal vision enabled!' or 'Thermal vision disabled!'})
end)

RegisterNetEvent('nduty:changePed', function(pedName)
    local pedModel = GetHashKey(pedName)
    RequestModel(pedModel)
    while not HasModelLoaded(pedModel) do
        Wait(10)
    end
    SetPlayerModel(PlayerId(), pedModel)
    lib.notify({type = 'success', description = 'Your ped has been changed!'})
end)

RegisterNetEvent('nduty:teleportToPlayerVehicle', function(targetId)
    local targetPed = GetPlayerPed(GetPlayerFromServerId(targetId))
    local vehicle = GetVehiclePedIsIn(targetPed, false)
    if vehicle then
        local coords = GetEntityCoords(vehicle)
        SetEntityCoords(PlayerPedId(), coords.x, coords.y, coords.z)
        lib.notify({type = 'success', description = 'Teleported to the player's vehicle!'})
    else
        lib.notify({type = 'error', description = 'Player is not in a vehicle.'})
    end
end)

-- Vehicle Options Submenu
lib.registerContext({
    id = 'vehicle_menu',
    title = 'Vehicle Options',
    options = {
        {
            title = 'Color Options',
            description = 'Change vehicle color.',
            menu = 'color_menu'
        }
    }
})

lib.registerContext({
    id = 'color_menu',
    title = 'Vehicle Colors',
    options = {
        {
            title = 'Red',
            event = 'nduty:changeVehicleColor',
            args = {color = 27}
        },
        {
            title = 'Blue',
            event = 'nduty:changeVehicleColor',
            args = {color = 64}
        },
        {
            title = 'Green',
            event = 'nduty:changeVehicleColor',
            args = {color = 55}
        },
        {
            title = 'Yellow',
            event = 'nduty:changeVehicleColor',
            args = {color = 88}
        },
        {
            title = 'Orange',
            event = 'nduty:changeVehicleColor',
            args = {color = 38}
        },
        {
            title = 'Pink',
            event = 'nduty:changeVehicleColor',
            args = {color = 135}
        },
        {
            title = 'Purple',
            event = 'nduty:changeVehicleColor',
            args = {color = 71}
        },
        {
            title = 'White',
            event = 'nduty:changeVehicleColor',
            args = {color = 134}
        },
        {
            title = 'Black',
            event = 'nduty:changeVehicleColor',
            args = {color = 12}
        },
        {
            title = 'Silver',
            event = 'nduty:changeVehicleColor',
            args = {color = 4}
        },
        {
            title = 'Gold',
            event = 'nduty:changeVehicleColor',
            args = {color = 37}
        },
        {
            title = 'Brown',
            event = 'nduty:changeVehicleColor',
            args = {color = 45}
        },
        {
            title = 'Teal',
            event = 'nduty:changeVehicleColor',
            args = {color = 64}
        },
        {
            title = 'Lime',
            event = 'nduty:changeVehicleColor',
            args = {color = 92}
        },
        {
            title = 'Cyan',
            event = 'nduty:changeVehicleColor',
            args = {color = 128}
        }
        -- Add more colors if necessary
    }
})

RegisterNetEvent('nduty:changeVehicleColor', function(data)
    local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
    if vehicle then
        SetVehicleColours(vehicle, data.color, data.color)
        lib.notify({type = 'success', description = 'Vehicle color changed!'})
    else
        lib.notify({type = 'error', description = 'You are not in a vehicle.'})
    end
end)
